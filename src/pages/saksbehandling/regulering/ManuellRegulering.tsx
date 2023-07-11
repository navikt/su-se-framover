import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Heading, Loader, TextField } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useOutletContext } from 'react-router-dom';

import { hentgjeldendeGrunnlagsdataOgVilkårsvurderinger } from '~src/api/GrunnlagOgVilkårApi';
import * as reguleringApi from '~src/api/reguleringApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import FradragForm from '~src/components/forms/vilkårOgGrunnlagForms/fradrag/FradragForm';
import {
    FradragFormData,
    fradragFormdataTilFradrag,
    fradragTilFradragFormData,
} from '~src/components/forms/vilkårOgGrunnlagForms/fradrag/FradragFormUtils';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import { måReguleresManuelt } from '~src/types/Fradrag';
import { Uføregrunnlag } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uføregrunnlag';
import { ÅrsakForManuell } from '~src/types/Regulering';
import { formatPeriode, parseIsoDateOnly } from '~src/utils/date/dateUtils';
import { fjernFradragSomIkkeErVelgbareEkskludertNavYtelserTilLivsopphold } from '~src/utils/fradrag/fradragUtil';

import messages from './manuellRegulering-nb';
import styles from './manuellRegulering.module.less';

interface FormData {
    uføre: Uføregrunnlag[];
    fradrag: FradragFormData[];
}

const ManuellRegulering = () => {
    const { formatMessage } = useI18n({ messages });
    const props = useOutletContext<SaksoversiktContext>();
    const urlParams = Routes.useRouteParams<typeof Routes.manuellRegulering>();
    const regulering = props.sak.reguleringer.find((r) => r.id === urlParams.reguleringId);
    const [gjeldendeGrunnlagsdataOgVilkårsvurderinger, hentGjeldendeGrunnlagsdataOgVilkårsvurderinger] = useApiCall(
        hentgjeldendeGrunnlagsdataOgVilkårsvurderinger,
    );
    const [regulerStatus, reguler] = useApiCall(reguleringApi.regulerManuelt);
    const [, hentSak] = useAsyncActionCreator(sakSlice.fetchSak);
    const navigate = useNavigate();

    const BackButton = () => (
        <Button
            onClick={() => navigate(Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id }))}
            variant="secondary"
            type="button"
        >
            {formatMessage('knapper.tilbake')}
        </Button>
    );
    const filtrerRegulerbarIEU = (grunnlag: Nullable<Uføregrunnlag>): grunnlag is Uføregrunnlag => grunnlag !== null;

    if (!regulering) {
        return (
            <div className={styles.feil}>
                <Alert variant="error">{formatMessage('fantIkkeRegulering')}</Alert>
                <BackButton />
            </div>
        );
    }

    const form = useForm<FormData>({
        defaultValues: {
            uføre: [],
            fradrag: [],
        },
    });

    const onSubmit = (values: FormData) =>
        reguler(
            {
                uføre: values.uføre,
                reguleringId: regulering.id,
                fradrag: values.fradrag.map((f) =>
                    fradragFormdataTilFradrag(f, {
                        fraOgMed: parseIsoDateOnly(regulering.periode.fraOgMed)!,
                        tilOgMed: parseIsoDateOnly(regulering.periode.tilOgMed)!,
                    }),
                ),
            },
            () => {
                hentSak({ saksnummer: props.sak.saksnummer.toString() }, () => {
                    Routes.navigateToSakIntroWithMessage(navigate, formatMessage('notification'), props.sak.id);
                });
            },
        );

    useEffect(() => {
        hentGjeldendeGrunnlagsdataOgVilkårsvurderinger(
            {
                sakId: props.sak.id,
                fraOgMed: regulering.periode.fraOgMed,
                tilOgMed: regulering.periode.tilOgMed,
            },
            (data) =>
                form.reset({
                    uføre:
                        data.grunnlagsdataOgVilkårsvurderinger.uføre?.vurderinger
                            .map((v) => v?.grunnlag)
                            .filter(filtrerRegulerbarIEU) ?? [],
                    fradrag: fjernFradragSomIkkeErVelgbareEkskludertNavYtelserTilLivsopphold(
                        data.grunnlagsdataOgVilkårsvurderinger.fradrag,
                    ).map((f) =>
                        fradragTilFradragFormData(f, {
                            fraOgMed: parseIsoDateOnly(regulering.periode.fraOgMed),
                            tilOgMed: parseIsoDateOnly(regulering.periode.tilOgMed),
                        }),
                    ),
                }),
        );
    }, []);

    return pipe(
        gjeldendeGrunnlagsdataOgVilkårsvurderinger,
        RemoteData.fold(
            () => <Loader />,
            () => <Loader />,
            () => null,
            (gjeldendeVedtaksdata) => {
                const { uføre, fradrag } = gjeldendeVedtaksdata.grunnlagsdataOgVilkårsvurderinger;
                const uføregrunnlag = uføre?.vurderinger.map((v) => v?.grunnlag).filter(filtrerRegulerbarIEU) ?? [];
                const harRegulerbarIEU = uføregrunnlag.some((v) => v.forventetInntekt > 0);
                const harRegulerbarFradrag = fradrag.some((f) => måReguleresManuelt(f.type));

                const problemer = hentProblemer(regulering.årsakForManuell);

                return (
                    <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
                        <Heading level="1" size="large" className={styles.tittel}>
                            {formatMessage('tittel')}
                        </Heading>
                        <p>{`${formatMessage('periode')}: ${formatPeriode(regulering.periode)}`}</p>

                        <div className={styles.container}>
                            <div className={styles.regulering}>
                                <Heading level="2" size="medium" className={styles.kategoriTittel}>
                                    {formatMessage('reguler.ieu')}
                                </Heading>

                                {harRegulerbarIEU ? (
                                    form
                                        .getValues('uføre')
                                        .filter((u) => u.forventetInntekt > 0)
                                        .map((u, index) => (
                                            <div key={u.id} className={styles.ieu}>
                                                <p>
                                                    {`${formatMessage('ieu.verdi.tidligere')}: ${
                                                        uføregrunnlag[index].forventetInntekt
                                                    } kr`}
                                                </p>
                                                <Controller
                                                    control={form.control}
                                                    name={`uføre.${index}.forventetInntekt`}
                                                    render={({ field }) => (
                                                        <TextField
                                                            value={field.value.toString()}
                                                            size="medium"
                                                            onChange={(e) => {
                                                                field.onChange(e.currentTarget.value);
                                                            }}
                                                            label={formatMessage('ieu', {
                                                                dato: formatPeriode(u.periode),
                                                            })}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        ))
                                ) : (
                                    <p>{formatMessage('ingen.ieu')}.</p>
                                )}
                            </div>

                            <div className={styles.regulering}>
                                <Heading level="2" size="medium" className={styles.kategoriTittel}>
                                    {formatMessage('reguler.fradrag')}
                                </Heading>
                                {harRegulerbarFradrag ? (
                                    <FradragForm
                                        name={'fradrag'}
                                        control={form.control}
                                        setValue={form.setValue}
                                        beregningsDato={{
                                            fraOgMed: parseIsoDateOnly(regulering.periode.fraOgMed),
                                            tilOgMed: parseIsoDateOnly(regulering.periode.tilOgMed),
                                        }}
                                        harEPS={false}
                                    />
                                ) : (
                                    <p>{formatMessage('ingen.fradrag')}.</p>
                                )}
                            </div>
                            {problemer.length > 0 && (
                                <Alert className={styles.advarsel} variant="warning">
                                    {problemer.map((problem, index) => (
                                        <p key={index}>{hentTekstForManuellÅrsak(problem, formatMessage)}</p>
                                    ))}
                                </Alert>
                            )}
                            {RemoteData.isFailure(regulerStatus) && <ApiErrorAlert error={regulerStatus.error} />}
                            <div className={styles.knapper}>
                                <BackButton />
                                <Button
                                    type="submit"
                                    className={styles.submit}
                                    loading={RemoteData.isPending(regulerStatus)}
                                >
                                    {formatMessage('knapper.send')}
                                </Button>
                            </div>
                        </div>
                    </form>
                );
            },
        ),
    );
};

const hentProblemer = (årsaker: ÅrsakForManuell[]) =>
    årsaker.filter(
        (årsak) =>
            årsak !== ÅrsakForManuell.ForventetInntektErStørreEnn0 &&
            årsak !== ÅrsakForManuell.FradragMåHåndteresManuelt,
    );

const hentTekstForManuellÅrsak = (
    årsak: ÅrsakForManuell,
    formatMessage: (id: keyof typeof messages) => string,
): string => {
    switch (årsak) {
        case ÅrsakForManuell.FradragMåHåndteresManuelt:
        case ÅrsakForManuell.ForventetInntektErStørreEnn0:
            return '';

        case ÅrsakForManuell.YtelseErMidlertidigStanset:
            return formatMessage('manuell.årsak.stans');
        case ÅrsakForManuell.DelvisOpphør:
        case ÅrsakForManuell.VedtakstidslinjeErIkkeSammenhengende:
            return formatMessage('manuell.årsak.hull');
        case ÅrsakForManuell.PågåendeAvkortingEllerBehovForFremtidigAvkorting:
            return formatMessage('manuell.årsak.avkorting');
        case ÅrsakForManuell.AvventerKravgrunnlag:
            return formatMessage('manuell.årsak.avventarKravgrunnlag');
        case ÅrsakForManuell.UtbetalingFeilet:
            return formatMessage('manuell.årsak.utbetalingFeilet');
    }
};

export default ManuellRegulering;
