import * as RemoteData from '@devexperts/remote-data-ts';
import { formatISO } from 'date-fns';
import { useFormik } from 'formik';
import { pipe } from 'fp-ts/lib/function';
import AlertStripe, { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import { Feiloppsummering, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Undertittel } from 'nav-frontend-typografi';
import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { kanSimuleres } from '~features/behandling/behandlingUtils';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { zip } from '~lib/arrayUtils';
import * as DateUtils from '~lib/dateUtils';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
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
import { Vurdering, Vurderingknapper } from '../../Vurdering';

import messages from './beregning-nb';
import styles from './beregning.module.less';
import { erIGyldigStatusForÅKunneBeregne, FradragTilFradragFormData } from './beregningUtils';
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
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });
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
        <Vurdering tittel={intl.formatMessage({ id: 'page.tittel' })}>
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
                                harEps={props.behandling.behandlingsinformasjon.ektefelle !== null}
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
                                showDelerAvPeriode
                            />
                        </div>
                        <Undertittel>
                            Beregning{' '}
                            {props.behandling.beregning
                                ? `${intl.formatDate(props.behandling.beregning.fraOgMed)}-
                            ${intl.formatDate(props.behandling.beregning.tilOgMed)}`
                                : ''}
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
        </Vurdering>
    );
};

function erFradragLike(fradrag: Fradrag[] | undefined, formFradrag: FradragFormData[]): boolean {
    if (!fradrag) return false;

    const fradragSomFormData = zip(
        FradragTilFradragFormData(fradrag.filter((f) => f.type !== Fradragstype.ForventetInntekt)),
        formFradrag
    );

    if (fradragSomFormData.length != formFradrag.length) return false;

    return fradragSomFormData.every(
        (p) =>
            p[0].beløp === p[1].beløp &&
            p[0].fraUtland === p[1].fraUtland &&
            p[0].periode?.fraOgMed?.toString() === p[1].periode?.fraOgMed?.toString() &&
            p[0].periode?.tilOgMed?.toString() === p[1].periode?.tilOgMed?.toString() &&
            p[0].tilhørerEPS === p[1].tilhørerEPS &&
            p[0].type === p[1].type &&
            p[0].utenlandskInntekt.beløpIUtenlandskValuta === p[1].utenlandskInntekt.beløpIUtenlandskValuta &&
            p[0].utenlandskInntekt.kurs === p[1].utenlandskInntekt.kurs &&
            p[0].utenlandskInntekt.valuta === p[1].utenlandskInntekt.valuta
    );
}

export default Beregning;
