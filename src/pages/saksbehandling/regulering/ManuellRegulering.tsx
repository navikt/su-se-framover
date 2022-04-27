import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Heading, Loader, TextField } from '@navikt/ds-react';
import { useFormik } from 'formik';
import { pipe } from 'fp-ts/lib/function';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import * as reguleringApi from '~src/api/reguleringApi';
import * as sakApi from '~src/api/sakApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import {
    fradragFormdataTilFradrag,
    fradragTilFradragFormData,
} from '~src/components/beregningOgSimulering/beregning/beregningUtils';
import { FradragFormData, FradragInputs } from '~src/components/beregningOgSimulering/beregning/FradragInputs';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import { Fradragstype } from '~src/types/Fradrag';
import { Uføregrunnlag } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uføregrunnlag';
import { ÅrsakForManuell } from '~src/types/Regulering';
import { Sak } from '~src/types/Sak';
import * as DateUtils from '~src/utils/date/dateUtils';
import { parseIsoDateOnly } from '~src/utils/date/dateUtils';
import { fjernFradragSomIkkeErValgbare } from '~src/utils/fradrag/fradragUtil';

import messages from './manuellRegulering-nb';
import styles from './manuellRegulering.module.less';

interface Props {
    sak: Sak;
}
interface FormData {
    uføre: Uføregrunnlag[];
    fradrag: FradragFormData[];
}

const ManuellRegulering = (props: Props) => {
    const { formatMessage } = useI18n({ messages });
    const urlParams = Routes.useRouteParams<typeof Routes.manuellRegulering>();
    const regulering = props.sak.reguleringer.find((r) => r.id === urlParams.reguleringId);
    const [gjeldendeGrunnlagsdataOgVilkårsvurderinger, hentGjeldendeGrunnlagsdataOgVilkårsvurderinger] = useApiCall(
        sakApi.hentgjeldendeGrunnlagsdataOgVilkårsvurderinger
    );
    const [regulerStatus, reguler] = useApiCall(reguleringApi.regulerManuelt);
    const [, hentSak] = useAsyncActionCreator(sakSlice.fetchSak);
    const history = useHistory();

    const BackButton = () => (
        <Button
            onClick={() => history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id }))}
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

    const formik = useFormik<FormData>({
        initialValues: {
            uføre: [],
            fradrag: [],
        },
        onSubmit: (values) =>
            reguler(
                {
                    uføre: values.uføre,
                    reguleringId: regulering.id,
                    fradrag: values.fradrag.map((f) =>
                        fradragFormdataTilFradrag(f, {
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            fraOgMed: parseIsoDateOnly(regulering.periode.fraOgMed)!,
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            tilOgMed: parseIsoDateOnly(regulering.periode.tilOgMed)!,
                        })
                    ),
                },
                () => {
                    hentSak({ saksnummer: props.sak.saksnummer.toString() }, () => {
                        history.push(Routes.createSakIntroLocation(formatMessage('notification'), props.sak.id));
                    });
                }
            ),
    });

    useEffect(() => {
        hentGjeldendeGrunnlagsdataOgVilkårsvurderinger(
            {
                sakId: props.sak.id,
                fraOgMed: regulering.periode.fraOgMed,
            },
            (data) =>
                formik.setValues({
                    uføre:
                        data.grunnlagsdataOgVilkårsvurderinger.uføre?.vurderinger
                            .map((v) => v?.grunnlag)
                            .filter(filtrerRegulerbarIEU) ?? [],
                    fradrag: fjernFradragSomIkkeErValgbare(data.grunnlagsdataOgVilkårsvurderinger.fradrag).map(
                        fradragTilFradragFormData
                    ),
                })
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
                const harRegulerbarFradrag = fradrag.some((f) =>
                    [Fradragstype.NAVytelserTilLivsopphold, Fradragstype.OffentligPensjon].includes(f.type)
                );

                const hentProblemer = (årsaker: ÅrsakForManuell[]) =>
                    årsaker.filter(
                        (årsak) =>
                            årsak !== ÅrsakForManuell.ForventetInntektErStørreEnn0 &&
                            årsak !== ÅrsakForManuell.FradragMåHåndteresManuelt
                    );

                const hentTekstForManuellÅrsak = (årsak: ÅrsakForManuell): string => {
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

                const problemer = hentProblemer(regulering.årsakForManuell);

                return (
                    <form onSubmit={formik.handleSubmit} className={styles.form}>
                        <Heading level="1" size="large" className={styles.tittel}>
                            {formatMessage('tittel')}
                        </Heading>

                        <div className={styles.container}>
                            <div className={styles.regulering}>
                                <Heading level="2" size="medium" className={styles.kategoriTittel}>
                                    {formatMessage('reguler.ieu')}
                                </Heading>

                                {harRegulerbarIEU ? (
                                    formik.values.uføre.map((u, index) => {
                                        if (u.forventetInntekt === 0) return null;

                                        return (
                                            <div key={u.id}>
                                                <p>
                                                    {`${formatMessage('ieu.verdi.tidligere')}: ${
                                                        uføregrunnlag[index].forventetInntekt
                                                    } kr`}
                                                </p>

                                                <TextField
                                                    size="medium"
                                                    value={u.forventetInntekt}
                                                    onChange={(e) =>
                                                        formik.setFieldValue(
                                                            `uføre.${index}.forventetInntekt`,
                                                            e.currentTarget.value
                                                        )
                                                    }
                                                    label={`Ny verdi for perioden ${DateUtils.formatPeriode(
                                                        u.periode
                                                    )}`}
                                                />
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p>{formatMessage('ingen.ieu')}.</p>
                                )}
                            </div>

                            <div className={styles.regulering}>
                                <Heading level="2" size="medium" className={styles.kategoriTittel}>
                                    {formatMessage('reguler.fradrag')}
                                </Heading>
                                {harRegulerbarFradrag ? (
                                    <FradragInputs
                                        harEps={false}
                                        feltnavn="fradrag"
                                        fradrag={formik.values.fradrag}
                                        errors={formik.errors.fradrag}
                                        onChange={formik.handleChange}
                                        onLeggTilClick={() => {
                                            formik.setValues({
                                                ...formik.values,
                                                fradrag: [
                                                    ...formik.values.fradrag,
                                                    {
                                                        periode: null,
                                                        beløp: null,
                                                        type: null,
                                                        fraUtland: false,
                                                        utenlandskInntekt: {
                                                            beløpIUtenlandskValuta: '',
                                                            valuta: '',
                                                            kurs: '',
                                                        },
                                                        tilhørerEPS: false,
                                                    },
                                                ],
                                            });
                                        }}
                                        onFjernClick={(index) => {
                                            formik.setValues((v) => ({
                                                ...v,
                                                fradrag: formik.values.fradrag.filter((_, idx) => idx !== index),
                                            }));
                                        }}
                                        onFradragChange={(index, value) => {
                                            formik.setFieldValue(`fradrag[${index}]`, value);
                                        }}
                                        beregningsDato={{
                                            fom: DateUtils.parseIsoDateOnly(regulering.periode.fraOgMed),
                                            tom: DateUtils.parseIsoDateOnly(regulering.periode.tilOgMed),
                                        }}
                                    />
                                ) : (
                                    <p>{formatMessage('ingen.fradrag')}.</p>
                                )}
                            </div>
                            {problemer.length > 0 && (
                                <Alert className={styles.advarsel} variant="warning">
                                    {problemer.map((problem, index) => (
                                        <p key={index}>{hentTekstForManuellÅrsak(problem)}</p>
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
            }
        )
    );
};

export default ManuellRegulering;
