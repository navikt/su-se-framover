import * as RemoteData from '@devexperts/remote-data-ts';
import { lastDayOfMonth } from 'date-fns';
import { useFormik } from 'formik';
import { pipe } from 'fp-ts/lib/function';
import AlertStripe from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Feilmelding } from 'nav-frontend-typografi';
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { useHistory } from 'react-router-dom';

import * as sakSlice from '~features/saksoversikt/sak.slice';
import { toDateOrNull } from '~lib/dateUtils';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import {
    FradragFormData,
    isValidFradrag,
    fradragSchema,
    FradragInputs,
} from '~pages/saksbehandling/steg/beregning/FradragInputs';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Behandlingsstatus } from '~types/Behandling';
import { Fradragstype } from '~types/Fradrag';

import Faktablokk from '../Faktablokk';
import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurdering, Vurderingknapper } from '../Vurdering';

import messages from './beregning-nb';
import styles from './beregning.module.less';
import VisBeregning from './VisBeregning';

interface FormData {
    fom: Nullable<Date>;
    tom: Nullable<Date>;
    fradrag: FradragFormData[];
}

const Beregning = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [needsBeregning, setNeedsBeregning] = useState(false);

    const { beregningStatus, simuleringStatus, utledetSatsInfo } = useAppSelector((state) => state.sak);
    const FradragUtenomForventetInntekt = (props.behandling.beregning?.fradrag ?? []).filter(
        (f) => f.type !== Fradragstype.ForventetInntekt
    );

    useEffect(() => {
        dispatch(sakSlice.getUtledetSatsInfo({ sakId: props.sakId, behandlingId: props.behandling.id }));
    }, []);

    const startBeregning = (values: FormData) => {
        if (!values.fom || !values.tom || !props.behandling.behandlingsinformasjon.utledetSats) {
            return;
        }

        const fradrag = values.fradrag.filter(isValidFradrag);
        if (fradrag.length !== values.fradrag.length) {
            return;
        }

        dispatch(
            sakSlice.startBeregning({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                sats: props.behandling.behandlingsinformasjon.utledetSats,
                fom: values.fom,
                tom: lastDayOfMonth(values.tom),
                fradrag: values.fradrag.map((f) => ({
                    //valdiering sikrer at feltet ikke er null
                    /* eslint-disable @typescript-eslint/no-non-null-assertion */
                    beløp: parseInt(f.beløp!, 10),
                    type: f.type!,
                    utenlandskInntekt: f.fraUtland
                        ? {
                              beløpIUtenlandskValuta: parseInt(f.utenlandskInntekt.beløpIUtenlandskValuta),
                              valuta: f.utenlandskInntekt.valuta,
                              kurs: Number.parseFloat(f.utenlandskInntekt.kurs),
                          }
                        : null,
                    /* eslint-enable @typescript-eslint/no-non-null-assertion */
                })),
            })
        );
    };

    const byttDato = (keyNavn: keyof Pick<FormData, 'fom' | 'tom'>, dato: Date | [Date, Date] | null) => {
        formik.setValues({
            ...formik.values,
            [keyNavn]: Array.isArray(dato) ? dato[0] : dato,
        });
    };

    const formik = useFormik<FormData>({
        initialValues: {
            fom: toDateOrNull(props.behandling.beregning?.fraOgMed),
            tom: toDateOrNull(props.behandling.beregning?.tilOgMed),
            fradrag: FradragUtenomForventetInntekt.map((f) => ({
                fraUtland: f.utenlandskInntekt !== null,
                beløp: f.beløp.toString(),
                utenlandskInntekt: {
                    beløpIUtenlandskValuta: f.utenlandskInntekt?.beløpIUtenlandskValuta.toString() ?? '',
                    valuta: f.utenlandskInntekt?.valuta.toString() ?? '',
                    kurs: f.utenlandskInntekt?.kurs.toString() ?? '',
                },
                type: f.type,
            })),
        },
        onSubmit(values) {
            startBeregning(values);
        },
        validationSchema: yup.object<FormData>({
            fom: yup.date().nullable().required(),
            tom: yup
                .date()
                .nullable()
                .required()
                .test('isAfterFom', 'Sluttdato må være etter startdato', function (tom) {
                    const { fom } = this.parent;
                    if (!tom || !fom) {
                        return false;
                    }

                    return fom <= tom;
                }),
            fradrag: yup.array(fradragSchema.required()).defined(),
        }),
        validateOnChange: hasSubmitted,
    });
    const history = useHistory();

    return (
        <Vurdering tittel={intl.formatMessage({ id: 'page.tittel' })}>
            {{
                left: (
                    <form
                        onSubmit={(e) => {
                            setHasSubmitted(true);
                            formik.handleSubmit(e);
                        }}
                    >
                        <div className={styles.utledetSatsOgForventetInntektContainer}>
                            <p>
                                {props.behandling.behandlingsinformasjon.utledetSats}{' '}
                                {intl.formatMessage({ id: 'display.sats' })}{' '}
                                {RemoteData.isSuccess(utledetSatsInfo)
                                    ? intl.formatNumber(utledetSatsInfo.value.satsBeløp)
                                    : intl.formatMessage({ id: 'display.finnerIkkeSatsBeløp' })}
                            </p>
                            <p>
                                {intl.formatMessage({ id: 'display.forventerArbeidsinntekt' })}{' '}
                                {props.behandling.behandlingsinformasjon.uførhet?.forventetInntekt
                                    ? props.behandling.behandlingsinformasjon.uførhet?.forventetInntekt
                                    : 0}
                            </p>
                        </div>
                        <div className={styles.datoContainer}>
                            <div>
                                <p>{intl.formatMessage({ id: 'datovelger.fom.legend' })}</p>
                                <DatePicker
                                    id="fom"
                                    selected={formik.values.fom}
                                    onChange={(dato) => byttDato('fom', dato)}
                                    dateFormat="MM/yyyy"
                                    showMonthYearPicker
                                    isClearable
                                    selectsEnd
                                    startDate={formik.values.fom}
                                    endDate={formik.values.tom}
                                    minDate={formik.values.fom}
                                />
                                {formik.errors.fom && <Feilmelding>{formik.errors.fom}</Feilmelding>}
                            </div>
                            <div>
                                <p>{intl.formatMessage({ id: 'datovelger.tom.legend' })}</p>
                                <DatePicker
                                    id="tom"
                                    selected={formik.values.tom}
                                    onChange={(dato) => byttDato('tom', dato)}
                                    dateFormat="MM/yyyy"
                                    showMonthYearPicker
                                    isClearable
                                    selectsEnd
                                    startDate={formik.values.fom}
                                    endDate={formik.values.tom}
                                    minDate={formik.values.fom}
                                />
                                {formik.errors.tom && <Feilmelding>{formik.errors.tom}</Feilmelding>}
                            </div>
                        </div>

                        <div className={styles.fradragInputsContainer}>
                            <FradragInputs
                                feltnavn="fradrag"
                                fradrag={formik.values.fradrag}
                                errors={formik.errors.fradrag}
                                intl={intl}
                                onChange={formik.handleChange}
                                setFieldValue={formik.setFieldValue}
                                onFjernClick={(index) => {
                                    formik.setValues({
                                        ...formik.values,
                                        fradrag: formik.values.fradrag.filter((_, idx) => idx !== index),
                                    });
                                }}
                                onLeggTilClick={() => {
                                    formik.setValues({
                                        ...formik.values,
                                        fradrag: [
                                            ...formik.values.fradrag,
                                            {
                                                beløp: null,
                                                type: null,
                                                fraUtland: false,
                                                utenlandskInntekt: {
                                                    beløpIUtenlandskValuta: '',
                                                    valuta: '',
                                                    kurs: '',
                                                },
                                            },
                                        ],
                                    });
                                }}
                            />
                        </div>

                        <div className={styles.startBeregningContainer}>
                            <Knapp htmlType="submit">{intl.formatMessage({ id: 'knapp.startBeregning' })}</Knapp>
                        </div>

                        {props.behandling.beregning && (
                            <div className={styles.visBeregningContainer}>
                                <VisBeregning
                                    beregning={props.behandling.beregning}
                                    forventetinntekt={
                                        props.behandling.behandlingsinformasjon.uførhet?.forventetInntekt ?? 0
                                    }
                                />
                            </div>
                        )}
                        {needsBeregning && !props.behandling.beregning && (
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
                                        {intl.formatMessage({ id: 'display.simuleringFeilet' })}
                                    </AlertStripe>
                                ),
                                () => null
                            )
                        )}
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onNesteClick={async () => {
                                if (
                                    RemoteData.isSuccess(beregningStatus) ||
                                    (props.behandling.beregning && RemoteData.isInitial(beregningStatus))
                                ) {
                                    if (props.behandling.status === Behandlingsstatus.BEREGNET_AVSLAG) {
                                        history.push(props.nesteUrl);
                                        return;
                                    }

                                    const res = await dispatch(
                                        sakSlice.startSimulering({
                                            sakId: props.sakId,
                                            behandlingId: props.behandling.id,
                                        })
                                    );

                                    if (sakSlice.startSimulering.fulfilled.match(res)) {
                                        history.push(props.nesteUrl);
                                    }
                                } else {
                                    setNeedsBeregning(true);
                                }
                            }}
                            onLagreOgFortsettSenereClick={() => {
                                formik.submitForm();
                            }}
                        />
                    </form>
                ),
                right: (
                    <Faktablokk
                        tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
                        fakta={[
                            {
                                tittel: intl.formatMessage({ id: 'display.fraSøknad.forventerArbeidsinntekt' }),
                                verdi:
                                    props.behandling.søknad.søknadInnhold.inntektOgPensjon.forventetInntekt?.toString() ??
                                    intl.formatMessage({ id: 'display.fraSøknad.nei' }),
                            },
                            {
                                tittel: intl.formatMessage({ id: 'display.fraSøknad.andreYtelserINav' }),
                                verdi: props.behandling.søknad.søknadInnhold.inntektOgPensjon.andreYtelserINav
                                    ? `${intl.formatMessage({ id: 'display.fraSøknad.nei' })}, ${
                                          props.behandling.søknad.søknadInnhold.inntektOgPensjon.andreYtelserINav
                                      }: ${
                                          props.behandling.søknad.søknadInnhold.inntektOgPensjon.andreYtelserINavBeløp
                                      }`
                                    : intl.formatMessage({ id: 'display.fraSøknad.nei' }),
                            },
                            {
                                tittel: intl.formatMessage({ id: 'display.fraSøknad.sømtOmAndreTrygdeytelser' }),
                                verdi:
                                    props.behandling.søknad.søknadInnhold.inntektOgPensjon.søktAndreYtelserIkkeBehandletBegrunnelse?.toString() ??
                                    intl.formatMessage({ id: 'display.fraSøknad.nei' }),
                            },
                            {
                                tittel: intl.formatMessage({
                                    id: 'display.fraSøknad.mottattSosialstønadSiste3måneder',
                                }),
                                verdi:
                                    props.behandling.søknad.søknadInnhold.inntektOgPensjon.sosialstønadBeløp?.toString() ??
                                    intl.formatMessage({ id: 'display.fraSøknad.nei' }),
                            },
                            {
                                tittel: intl.formatMessage({
                                    id: 'display.fraSøknad.trygdeytelserIUtlandet',
                                }),
                                verdi: props.behandling.søknad.søknadInnhold.inntektOgPensjon.trygdeytelserIUtlandet ? (
                                    <>
                                        {props.behandling.søknad.søknadInnhold.inntektOgPensjon.trygdeytelserIUtlandet.map(
                                            (ytelse, index) => (
                                                <div key={index}>
                                                    <p>Beløp: {ytelse.beløp} i lokal valuta</p>
                                                    <p>Type: {ytelse.type}</p>
                                                    <p>Fra: {ytelse.fra}</p>
                                                </div>
                                            )
                                        )}
                                    </>
                                ) : (
                                    intl.formatMessage({ id: 'display.fraSøknad.nei' })
                                ),
                            },
                            {
                                tittel: intl.formatMessage({
                                    id: 'display.fraSøknad.tjenestepensjon/pensjonssparing',
                                }),
                                verdi: props.behandling.søknad.søknadInnhold.inntektOgPensjon.pensjon ? (
                                    <>
                                        {props.behandling.søknad.søknadInnhold.inntektOgPensjon.pensjon.map(
                                            (p, index) => (
                                                <div key={index}>
                                                    <p>Beløp: {p.beløp}</p>
                                                    <p>Ordning: {p.ordning}</p>
                                                </div>
                                            )
                                        )}
                                    </>
                                ) : (
                                    intl.formatMessage({ id: 'display.fraSøknad.nei' })
                                ),
                            },
                        ]}
                    />
                ),
            }}
        </Vurdering>
    );
};

export default Beregning;
