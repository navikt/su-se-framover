import * as RemoteData from '@devexperts/remote-data-ts';
import { formatISO } from 'date-fns';
import { useFormik } from 'formik';
import { getEq } from 'fp-ts/Array';
import * as B from 'fp-ts/lib/boolean';
import * as D from 'fp-ts/lib/Date';
import { struct } from 'fp-ts/lib/Eq';
import { pipe } from 'fp-ts/lib/function';
import * as S from 'fp-ts/lib/string';
import AlertStripe, { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import { Feiloppsummering, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Undertittel } from 'nav-frontend-typografi';
import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import ToKolonner from '~components/toKolonner/ToKolonner';
import { kanSimuleres } from '~features/behandling/behandlingUtils';
import fradragstypeMessages from '~features/fradrag/fradragstyper-nb';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import * as DateUtils from '~lib/dateUtils';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { eqNullable, Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import {
    FradragFormData,
    isValidFradrag,
    fradragSchema,
    FradragInputs,
} from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/FradragInputs';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Behandlingsstatus } from '~types/Behandling';
import { Beregning } from '~types/Beregning';
import { Fradrag, Fradragstype, FradragTilhører } from '~types/Fradrag';

import BeregningFaktablokk from '../../faktablokk/faktablokker/BeregningFaktablokk';
import sharedI18n from '../../sharedI18n-nb';
import SharedStyles from '../../sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '../../types';
import { Vurderingknapper } from '../../Vurdering';

import messages from './beregning-nb';
import styles from './beregning.module.less';
import { UtenlandskInntektFormData } from './beregningstegTypes';
import { erIGyldigStatusForÅKunneBeregne, fradragTilFradragFormData } from './beregningUtils';
import VisBeregning from './VisBeregning';

interface FormData {
    fradrag: FradragFormData[];
    begrunnelse: Nullable<string>;
}

function getInitialValues(beregning: Nullable<Beregning>): FormData {
    const fradragUtenomForventetInntekt = (beregning?.fradrag ?? []).filter(
        (f) => f.type !== Fradragstype.ForventetInntekt
    );

    return {
        fradrag: fradragUtenomForventetInntekt.map((f) => ({
            periode: {
                fraOgMed: DateUtils.toDateOrNull(f.periode?.fraOgMed),
                tilOgMed: DateUtils.toDateOrNull(f.periode?.tilOgMed),
            },
            fraUtland: f.utenlandskInntekt !== null,
            beløp: f.beløp.toString(),
            utenlandskInntekt: {
                beløpIUtenlandskValuta: f.utenlandskInntekt?.beløpIUtenlandskValuta.toString() ?? '',
                valuta: f.utenlandskInntekt?.valuta.toString() ?? '',
                kurs: f.utenlandskInntekt?.kurs.toString() ?? '',
            },
            type: f.type,
            tilhørerEPS: f.tilhører === FradragTilhører.EPS,
        })),
        begrunnelse: beregning?.begrunnelse ?? '',
    };
}

const Beregning = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const intl = useI18n({ messages: { ...sharedI18n, ...messages, ...fradragstypeMessages } });
    const [needsBeregning, setNeedsBeregning] = useState(false);

    const { beregningStatus, simuleringStatus } = useAppSelector((state) => state.sak);

    const stønadsperiode = useMemo(() => {
        const fom = props.behandling.stønadsperiode?.periode.fraOgMed;
        const tom = props.behandling.stønadsperiode?.periode.tilOgMed;
        if (!fom || !tom) {
            return null;
        }
        return {
            fom: DateUtils.parseIsoDateOnly(fom),
            tom: DateUtils.parseIsoDateOnly(tom),
        };
    }, [props.behandling.stønadsperiode]);

    useEffect(() => {
        dispatch(sakSlice.default.actions.resetBeregningstatus());
    }, []);

    if (!erIGyldigStatusForÅKunneBeregne(props.behandling) || stønadsperiode === null) {
        return <div>{intl.formatMessage({ id: 'beregning.behandlingErIkkeFerdig' })}</div>;
    }

    const startBeregning = async (values: FormData) => {
        if (!props.behandling.behandlingsinformasjon.utledetSats) {
            return null;
        }

        const fradrag = values.fradrag.filter(isValidFradrag);
        if (fradrag.length !== values.fradrag.length) {
            return null;
        }

        const res = await dispatch(
            sakSlice.startBeregning({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                sats: props.behandling.behandlingsinformasjon.utledetSats,
                fradrag: values.fradrag.map((f) => ({
                    //valdiering sikrer at feltet ikke er null
                    /* eslint-disable @typescript-eslint/no-non-null-assertion */
                    periode:
                        f.periode?.fraOgMed && f.periode.tilOgMed
                            ? {
                                  fraOgMed: formatISO(f.periode.fraOgMed, { representation: 'date' }),
                                  tilOgMed: formatISO(f.periode.tilOgMed, { representation: 'date' }),
                              }
                            : null,
                    beløp: parseInt(f.beløp!, 10),
                    type: f.type!,
                    utenlandskInntekt: f.fraUtland
                        ? {
                              beløpIUtenlandskValuta: parseInt(f.utenlandskInntekt.beløpIUtenlandskValuta),
                              valuta: f.utenlandskInntekt.valuta,
                              kurs: Number.parseFloat(f.utenlandskInntekt.kurs),
                          }
                        : null,
                    tilhører: f.tilhørerEPS ? FradragTilhører.EPS : FradragTilhører.Bruker,
                    /* eslint-enable @typescript-eslint/no-non-null-assertion */
                })),
                begrunnelse: values.begrunnelse,
            })
        );

        if (sakSlice.startBeregning.fulfilled.match(res)) {
            return res.payload;
        }
        return null;
    };

    const handleLagreOgFortsettSenere = (values: FormData) => {
        startBeregning(values);
        if (RemoteData.isSuccess(beregningStatus)) {
            history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
        }
    };

    const formik = useFormik<FormData>({
        initialValues: getInitialValues(props.behandling.beregning),
        async onSubmit(values, helpers) {
            const b = await startBeregning(values);
            if (b) {
                setNeedsBeregning(false);
                helpers.resetForm({ values: getInitialValues(b.beregning) });
            }
        },
        validationSchema: yup.object<FormData>({
            fradrag: yup.array(fradragSchema.required()).defined(),
            begrunnelse: yup.string(),
        }),
        validateOnChange: false,
    });
    const history = useHistory();

    const handleSave = async (nesteUrl: string) => {
        const formikErrors = await formik.validateForm();
        if (Object.values(formikErrors).length > 0) {
            return;
        }
        if (formik.dirty) {
            if (erFradragLike(props.behandling.beregning?.fradrag, formik.values.fradrag)) {
                startBeregning(formik.values);
            } else {
                setNeedsBeregning(true);
                return;
            }
        }
        if (
            RemoteData.isSuccess(beregningStatus) ||
            (props.behandling.beregning && RemoteData.isInitial(beregningStatus))
        ) {
            if (!kanSimuleres(props.behandling)) {
                history.push(nesteUrl);
                return;
            }

            const res = await dispatch(
                sakSlice.startSimulering({
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                })
            );

            if (sakSlice.startSimulering.fulfilled.match(res)) {
                history.push(nesteUrl);
            }
        } else {
            setNeedsBeregning(true);
        }
    };

    return (
        <ToKolonner tittel={intl.formatMessage({ id: 'page.tittel' })}>
            {{
                left: (
                    <form
                        onSubmit={(e) => {
                            formik.handleSubmit(e);
                        }}
                    >
                        <Undertittel>Fradrag</Undertittel>
                        <div className={styles.container}>
                            <FradragInputs
                                harEps={props.behandling.grunnlagsdataOgVilkårsvurderinger.bosituasjon[0].fnr !== null}
                                feltnavn="fradrag"
                                fradrag={formik.values.fradrag}
                                errors={formik.errors.fradrag}
                                intl={intl}
                                onChange={formik.handleChange}
                                onFradragChange={(index, value) => {
                                    formik.setFieldValue(`fradrag[${index}]`, value);
                                }}
                                onFjernClick={(index) => {
                                    formik.setValues((v) => ({
                                        ...v,
                                        fradrag: formik.values.fradrag.filter((_, idx) => idx !== index),
                                    }));
                                }}
                                beregningsDato={stønadsperiode}
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
                            />
                        </div>
                        <Undertittel>
                            Beregning
                            {props.behandling.beregning &&
                                ` ${DateUtils.formatMonthYear(props.behandling.beregning.fraOgMed, intl)}-
                                ${DateUtils.formatMonthYear(props.behandling.beregning.tilOgMed, intl)}`}
                        </Undertittel>
                        <div className={styles.beregningsContainer}>
                            {props.behandling.beregning && <VisBeregning beregning={props.behandling.beregning} />}
                            {formik.errors && (
                                <Feiloppsummering
                                    feil={formikErrorsTilFeiloppsummering(formik.errors)}
                                    tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                                    hidden={!formikErrorsHarFeil(formik.errors)}
                                    className={styles.feiloppsummering}
                                />
                            )}
                            <Hovedknapp htmlType="submit" spinner={RemoteData.isPending(beregningStatus)} mini>
                                {props.behandling.beregning
                                    ? intl.formatMessage({ id: 'knapp.startNyBeregning' })
                                    : intl.formatMessage({ id: 'knapp.startBeregning' })}
                            </Hovedknapp>

                            {props.behandling.status === Behandlingsstatus.BEREGNET_AVSLAG && (
                                <AlertStripe type="advarsel" className={styles.avslagadvarsel}>
                                    {intl.formatMessage({
                                        id:
                                            props.behandling.beregning &&
                                            props.behandling.beregning.månedsberegninger.some((m) => m.beløp > 0)
                                                ? 'beregning.nullutbetalingIStartEllerSlutt'
                                                : 'beregning.førerTilAvslag',
                                    })}
                                </AlertStripe>
                            )}
                        </div>
                        <div className={SharedStyles.textareaContainer}>
                            <Textarea
                                label={intl.formatMessage({ id: 'input.label.begrunnelse' })}
                                name="begrunnelse"
                                onChange={formik.handleChange}
                                value={formik.values.begrunnelse ?? ''}
                                feil={formik.errors.begrunnelse}
                            />
                        </div>

                        {RemoteData.isFailure(beregningStatus) && (
                            <AlertStripeFeil>
                                <p>{intl.formatMessage({ id: 'alert.feil.beregningFeilet' })}</p>
                                <p>
                                    {beregningStatus.error.body?.message ||
                                        intl.formatMessage({ id: 'feilmelding.ukjentFeil' })}
                                </p>
                            </AlertStripeFeil>
                        )}
                        {needsBeregning && (
                            <AlertStripe type="advarsel">
                                {intl.formatMessage({ id: 'alert.advarsel.kjørBeregningFørst' })}
                            </AlertStripe>
                        )}
                        {pipe(
                            simuleringStatus,
                            RemoteData.fold(
                                () => null,
                                () => (
                                    <NavFrontendSpinner>
                                        {intl.formatMessage({ id: 'display.simulerer' })}
                                    </NavFrontendSpinner>
                                ),
                                () => (
                                    <AlertStripe type="feil">
                                        {intl.formatMessage({ id: 'alert.feil.simuleringFeilet' })}
                                    </AlertStripe>
                                ),
                                () => null
                            )
                        )}
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onNesteClick={() => {
                                handleSave(props.nesteUrl);
                            }}
                            onLagreOgFortsettSenereClick={() => {
                                formik.validateForm().then((res) => {
                                    if (Object.keys(res).length === 0) {
                                        handleLagreOgFortsettSenere(formik.values);
                                    }
                                });
                            }}
                        />
                    </form>
                ),
                right: <BeregningFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

function erFradragLike(fradrag: Fradrag[] | undefined, formFradrag: FradragFormData[]): boolean {
    if (!fradrag) return false;

    const fradragFraBasen = fradrag
        .filter((f) => f.type !== Fradragstype.ForventetInntekt)
        .map(fradragTilFradragFormData);

    return getEq(eqFradragFormData).equals(formFradrag, fradragFraBasen);
}

const eqUtenlandskInntekt = struct<UtenlandskInntektFormData>({
    beløpIUtenlandskValuta: S.Eq,
    valuta: S.Eq,
    kurs: S.Eq,
});

const eqPeriode = struct<{ fraOgMed: Nullable<Date>; tilOgMed: Nullable<Date> }>({
    fraOgMed: eqNullable(D.Eq),
    tilOgMed: eqNullable(D.Eq),
});

const eqFradragFormData = struct<FradragFormData>({
    type: eqNullable(S.Eq),
    beløp: eqNullable(S.Eq),
    fraUtland: B.Eq,
    utenlandskInntekt: eqUtenlandskInntekt,
    tilhørerEPS: B.Eq,
    periode: eqNullable(eqPeriode),
});

export default Beregning;
