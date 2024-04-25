import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyShort, Button, Heading, Label, Loader, TextField } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
import { useEffect } from 'react';
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
import {
    BeløpErStørreEnForventet,
    BrukerManglerSupplement,
    DelvisOpphør,
    FinnesFlerePerioderAvFradrag,
    FradragErUtenlandsinntekt,
    MismatchMellomBeløpFraSupplementOgFradrag,
    SupplementHarFlereVedtaksperioderForFradrag,
    SupplementInneholderIkkeFradraget,
    YtelseErMidlertidigStanset,
    ÅrsakForManuell,
    ÅrsakForManuellType,
} from '~src/types/Regulering';
import { formatPeriode, parseIsoDateOnly } from '~src/utils/date/dateUtils';
import { fjernFradragSomIkkeErVelgbareEkskludertNavYtelserTilLivsopphold } from '~src/utils/fradrag/fradragUtil';
import { formatPeriodeMedOptionalTilOgMed } from '~src/utils/periode/periodeUtils';

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

                return (
                    <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
                        <Heading level="2" size="large" className={styles.tittel}>
                            {formatMessage('tittel')}
                        </Heading>

                        <div className={styles.container}>
                            <ÅrsakForManuellRegulering årsaker={regulering.årsakForManuell} />
                            <Heading
                                level="3"
                                size="medium"
                            >{`${formatMessage('periode')}: ${formatPeriode(regulering.periode)}`}</Heading>

                            <div className={styles.regulering}>
                                <Heading level="3" size="medium" className={styles.kategoriTittel}>
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
                                                            onChange={field.onChange}
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
                                <Heading level="3" size="medium" className={styles.kategoriTittel}>
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
                            {RemoteData.isFailure(regulerStatus) && <ApiErrorAlert error={regulerStatus.error} />}
                            <div className={styles.knapper}>
                                <BackButton />
                                <Button type="submit" loading={RemoteData.isPending(regulerStatus)}>
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

export default ManuellRegulering;

const ÅrsakForManuellRegulering = (props: { årsaker: ÅrsakForManuell[] }) => {
    return props.årsaker.length > 0 ? (
        <Alert className={styles.advarsel} variant="warning">
            <Label>Reguleringen er til manuell behandling fordi: </Label>
            <ul className={styles.årsaksContainer}>
                {props.årsaker.map((årsak) => {
                    switch (årsak.type) {
                        case ÅrsakForManuellType.FradragMåHåndteresManuelt: {
                            return (
                                <li>
                                    <BodyShort>Fradraget må håndteres manuelt av historiske grunner</BodyShort>
                                    <BodyShort>{årsak.begrunnelse ?? ''}</BodyShort>
                                </li>
                            );
                        }
                        case ÅrsakForManuellType.UtbetalingFeilet: {
                            return (
                                <li>
                                    <BodyShort>Utbetaling feilet for behandlingen</BodyShort>
                                    <BodyShort>{årsak.begrunnelse ?? ''}</BodyShort>
                                </li>
                            );
                        }
                        case ÅrsakForManuellType.BrukerManglerSupplement: {
                            const asserted = årsak as BrukerManglerSupplement;

                            return (
                                <li>
                                    <BodyShort>Bruker mangler supplement for fradrag</BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>Fradraget tilhører - {asserted.fradragTilhører}</BodyShort>
                                        <BodyShort>For fradrag - {asserted.fradragskategori}</BodyShort>
                                        <BodyShort>{asserted.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakForManuellType.SupplementInneholderIkkeFradraget: {
                            const asserted = årsak as SupplementInneholderIkkeFradraget;
                            return (
                                <li>
                                    <BodyShort>Innsendt supplement inneholder ikke fradrag</BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>Fradraget tilhører - {asserted.fradragTilhører}</BodyShort>
                                        <BodyShort>For fradrag - {asserted.fradragskategori}</BodyShort>
                                        <BodyShort>{asserted.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakForManuellType.FinnesFlerePerioderAvFradrag: {
                            const asserted = årsak as FinnesFlerePerioderAvFradrag;
                            return (
                                <li>
                                    <BodyShort>Funnet flere perioder av samme fradrag</BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>Fradraget tilhører - {asserted.fradragTilhører}</BodyShort>
                                        <BodyShort>For fradrag - {asserted.fradragskategori}</BodyShort>
                                        <BodyShort>{asserted.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakForManuellType.FradragErUtenlandsinntekt: {
                            const asserted = årsak as FradragErUtenlandsinntekt;
                            return (
                                <li>
                                    <BodyShort>Fradrag er markert som utenlandsk</BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>Fradraget tilhører - {asserted.fradragTilhører}</BodyShort>
                                        <BodyShort>For fradrag - {asserted.fradragskategori}</BodyShort>
                                        <BodyShort>{asserted.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakForManuellType.SupplementHarFlereVedtaksperioderForFradrag: {
                            const asserted = årsak as SupplementHarFlereVedtaksperioderForFradrag;
                            return (
                                <li>
                                    <BodyShort>
                                        Supplementet inneholdt flere vedtaksperioder for fradrag som kan reguleres
                                    </BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>Fradraget tilhører - {asserted.fradragTilhører}</BodyShort>
                                        <BodyShort>For fradrag - {asserted.fradragskategori}</BodyShort>
                                        <BodyShort>Vedtaksperioder</BodyShort>
                                        <div className={styles.årsaksdetaljer}>
                                            {asserted.eksterneReguleringsvedtakperioder.map((periode) => (
                                                <BodyShort key={`${periode.fraOgMed}-${periode.tilOgMed}`}>
                                                    {formatPeriodeMedOptionalTilOgMed(periode)}
                                                </BodyShort>
                                            ))}
                                        </div>
                                        <BodyShort>{asserted.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakForManuellType.MismatchMellomBeløpFraSupplementOgFradrag: {
                            const asserted = årsak as MismatchMellomBeløpFraSupplementOgFradrag;
                            return (
                                <li>
                                    <BodyShort>
                                        Mismatch mellom beløpet i supplementet, og fra som er i fradraget før regulering
                                    </BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>Fradraget tilhører - {asserted.fradragTilhører}</BodyShort>
                                        <BodyShort>For fradrag - {asserted.fradragskategori}</BodyShort>
                                        <BodyShort>
                                            Vårt beløp før regulering {asserted.vårtBeløpFørRegulering}
                                        </BodyShort>
                                        <BodyShort>
                                            Supplert beløp for regulering {asserted.eksterntBeløpFørRegulering}
                                        </BodyShort>
                                        <BodyShort>{asserted.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakForManuellType.BeløpErStørreEnForventet: {
                            const asserted = årsak as BeløpErStørreEnForventet;
                            return (
                                <li>
                                    <BodyShort>
                                        Beløpet i supplementetet er større enn det vi forventet etter regulering
                                    </BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>Fradraget tilhører - {asserted.fradragTilhører}</BodyShort>
                                        <BodyShort>For fradrag - {asserted.fradragskategori}</BodyShort>
                                        <BodyShort>
                                            Forventet beløp etter regulering {asserted.forventetBeløpEtterRegulering}
                                        </BodyShort>
                                        <BodyShort>
                                            Supplert beløp etter regulering {asserted.eksterntBeløpEtterRegulering}
                                        </BodyShort>
                                        <BodyShort>{asserted.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakForManuellType.YtelseErMidlertidigStanset: {
                            const asserted = årsak as YtelseErMidlertidigStanset;
                            return (
                                <li>
                                    <BodyShort>Ytelsen er midlertidig stanset</BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>{asserted.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakForManuellType.ForventetInntektErStørreEnn0: {
                            return (
                                <li>
                                    <BodyShort>Forventet inntekt må justeres</BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>{årsak.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakForManuellType.AutomatiskSendingTilUtbetalingFeilet: {
                            return (
                                <li>
                                    <BodyShort>
                                        Automatisk behandling av reguleringen feilet fordi utbetaling feilet
                                    </BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>{årsak.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakForManuellType.VedtakstidslinjeErIkkeSammenhengende: {
                            return (
                                <li>
                                    <BodyShort>Vedtakstidslinjen inneholder hull</BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>{årsak.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                        case ÅrsakForManuellType.DelvisOpphør: {
                            const asserted = årsak as DelvisOpphør;
                            return (
                                <li>
                                    <BodyShort>Saken er delvis opphørt</BodyShort>
                                    <div className={styles.årsaksdetaljer}>
                                        <BodyShort>Opphørte perioder</BodyShort>
                                        <div className={styles.årsaksdetaljer}>
                                            {asserted.opphørsperioder.map((periode) => formatPeriode(periode))}
                                        </div>
                                        <BodyShort>{asserted.begrunnelse}</BodyShort>
                                    </div>
                                </li>
                            );
                        }
                    }
                })}
            </ul>
        </Alert>
    ) : (
        <></>
    );
};
