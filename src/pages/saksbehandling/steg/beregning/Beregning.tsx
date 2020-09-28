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

import { FradragFormData, isValidFradrag, fradragSchema, FradragInputs } from '~features/beregning';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { toDateOrNull } from '~lib/dateUtils';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { DelerAvPeriode } from '~types/Fradrag';

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
    fradrag: Array<FradragFormData>;
}

const Beregning = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [needsBeregning, setNeedsBeregning] = useState(false);

    const [beregningStatus, simuleringStatus, utledetSatsInfo] = useAppSelector((state) => [
        state.sak.beregningStatus,
        state.sak.simuleringStatus,
        state.sak.utledetSatsInfo,
    ]);

    useEffect(() => {
        dispatch(sakSlice.getUtledetSatsInfo({ sakId: props.sakId, behandlingId: props.behandling.id }));
    }, []);

    const startBeregning = (values: FormData) => {
        if (!values.fom || !values.tom) {
            return;
        }
        if (!props.behandling.behandlingsinformasjon.utledetSats) {
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
                fradrag,
            })
        );
    };

    const byttDato = (keyNavn: keyof Pick<FormData, 'fom' | 'tom'>, dato: Date | [Date, Date] | null) => {
        formik.setValues({
            ...formik.values,
            [keyNavn]: Array.isArray(dato) ? dato[0] : dato,
        });
    };

    const periodeChanger = (
        keyNavn: keyof DelerAvPeriode,
        dato: Date | [Date, Date] | null,
        index: number,
        fradrag: Array<FradragFormData>
    ) => {
        const nyFradrag = [...fradrag];

        nyFradrag[index] = {
            ...nyFradrag[index],
            delerAvPeriodeData: {
                ...nyFradrag[index].delerAvPeriodeData,
                [keyNavn]: dato,
            },
        };

        formik.setValues({
            ...formik.values,
            fradrag: nyFradrag,
        });
    };

    const formik = useFormik<FormData>({
        initialValues: {
            fom: toDateOrNull(props.behandling.beregning?.fom),
            tom: toDateOrNull(props.behandling.beregning?.tom),
            fradrag: props.behandling.beregning?.fradrag ?? [],
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
                        {console.log(formik.values)}
                        <div className={styles.summering}>
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

                        <div className={styles.fradrag}>
                            <FradragInputs
                                feltnavn="fradrag"
                                fradrag={formik.values.fradrag}
                                errors={formik.errors.fradrag}
                                intl={intl}
                                onChange={formik.handleChange}
                                periodeChanger={periodeChanger}
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
                                                beskrivelse: null,
                                                type: null,
                                                fraUtland: false,
                                                fraUtlandInntekt: {
                                                    beløpUtenlandskValuta: null,
                                                    valuta: null,
                                                    kurs: null,
                                                },
                                                delerAvPeriode: false,
                                                delerAvPeriodeData: { fraOgMed: null, tilOgMed: null },
                                            },
                                        ],
                                    });
                                }}
                            />
                        </div>

                        <div className={styles.bottomButtons}>
                            <Knapp htmlType="submit">{intl.formatMessage({ id: 'knapp.startBeregning' })}</Knapp>
                        </div>

                        {props.behandling.beregning && (
                            <div className={styles.beregning}>
                                <VisBeregning beregning={props.behandling.beregning} />
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
                                tittel: intl.formatMessage({ id: 'display.fraSøknad.tjenerPengerIUtland' }),
                                verdi:
                                    props.behandling.søknad.søknadInnhold.inntektOgPensjon.tjenerPengerIUtlandetBeløp?.toString() ??
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
                                verdi:
                                    props.behandling.søknad.søknadInnhold.inntektOgPensjon.tjenerPengerIUtlandetBeløp?.toString() ??
                                    intl.formatMessage({ id: 'display.fraSøknad.nei' }),
                            },
                            {
                                tittel: intl.formatMessage({
                                    id: 'display.fraSøknad.tjenestepensjon/pensjonssparing',
                                }),
                                verdi:
                                    props.behandling.søknad.søknadInnhold.inntektOgPensjon.trygdeytelserIUtlandet?.toString() ??
                                    intl.formatMessage({ id: 'display.fraSøknad.nei' }),
                            },
                        ]}
                    />
                ),
            }}
        </Vurdering>
    );
};

export default Beregning;
