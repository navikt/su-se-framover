import { lastDayOfMonth } from 'date-fns';
import { useFormik } from 'formik';
import { Knapp } from 'nav-frontend-knapper';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useHistory } from 'react-router-dom';

import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch } from '~redux/Store';

import messages from '../../saksoversikt/beregning/beregning-nb';
import { FradragFormData, FradragInputs, fradragSchema, isValidFradrag, toDateOrNull } from '../beregning/Beregning';
import VisBeregning from '../beregning/VisBeregning';

import styles from './beregning.module.less';
import Faktablokk from './Faktablokk';
import { VilkårsvurderingBaseProps } from './types';
import { Vurdering, Vurderingknapper } from './Vurdering';

interface FormData {
    fom: Nullable<Date>;
    tom: Nullable<Date>;
    fradrag: Array<FradragFormData>;
}

const Beregning = (props: VilkårsvurderingBaseProps) => {
    const intl = useI18n({ messages });
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const startBeregning = () => {
        if (!formik.values.fom || !formik.values.tom) {
            return;
        }
        if (!props.behandling.behandlingsinformasjon.utledetSats) {
            return;
        }
        const fradrag = formik.values.fradrag.filter(isValidFradrag);
        if (fradrag.length !== formik.values.fradrag.length) {
            return;
        }

        dispatch(
            sakSlice.startBeregning({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                sats: props.behandling.behandlingsinformasjon.utledetSats,
                fom: formik.values.fom,
                tom: lastDayOfMonth(formik.values.tom),
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

    const formik = useFormik<FormData>({
        initialValues: {
            fom: toDateOrNull(props.behandling.beregning?.fom),
            tom: toDateOrNull(props.behandling.beregning?.tom),
            fradrag: props.behandling.beregning?.fradrag ?? [],
        },
        onSubmit(values) {
            if (!values || !props.behandling.beregning) return;

            history.push(props.nesteUrl);
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
        <Vurdering tittel="Beregning">
            {{
                left: (
                    <form
                        onSubmit={(e) => {
                            setHasSubmitted(true);
                            formik.handleSubmit(e);
                        }}
                    >
                        <div className={styles.summering}>
                            <p>{props.behandling.behandlingsinformasjon.utledetSats} sats: xxx</p>
                            <p>Forventet inntekt etter uføre (IEU):</p>
                        </div>
                        <div className={styles.datoContainer}>
                            <div>
                                <p>Fra og med</p>
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
                            </div>
                            <div>
                                <p>Til og med</p>
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
                            </div>
                        </div>

                        <div className={styles.fradrag}>
                            <FradragInputs
                                feltnavn="fradrag"
                                fradrag={formik.values.fradrag}
                                errors={formik.errors.fradrag}
                                intl={intl}
                                onChange={formik.handleChange}
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
                                            { beløp: null, beskrivelse: null, type: null },
                                        ],
                                    });
                                }}
                            />
                        </div>

                        <div className={styles.bottomButtons}>
                            <Knapp
                                onClick={(e) => {
                                    e.preventDefault();
                                    startBeregning();
                                }}
                            >
                                Start beregning
                            </Knapp>
                        </div>

                        {props.behandling.beregning && (
                            <div className={styles.beregning}>
                                <VisBeregning beregning={props.behandling.beregning} />
                            </div>
                        )}
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={() => null}
                        />
                    </form>
                ),
                right: (
                    <Faktablokk
                        tittel="Fra søknad"
                        fakta={[
                            {
                                tittel: 'Forventer du å ha arbeidsinntekt fremover?',
                                verdi:
                                    props.behandling.søknad.søknadInnhold.inntektOgPensjon.forventetInntekt?.toString() ??
                                    'Nei',
                            },
                            {
                                tittel: 'Tjener du penger i utlandet?',
                                verdi:
                                    props.behandling.søknad.søknadInnhold.inntektOgPensjon.tjenerPengerIUtlandetBeløp?.toString() ??
                                    'Nei',
                            },
                            {
                                tittel: 'Har du andre ytelser i NAV?',
                                verdi: props.behandling.søknad.søknadInnhold.inntektOgPensjon.andreYtelserINav
                                    ? `Ja, ${props.behandling.søknad.søknadInnhold.inntektOgPensjon.andreYtelserINav}: ${props.behandling.søknad.søknadInnhold.inntektOgPensjon.andreYtelserINavBeløp}`
                                    : 'Nei',
                            },
                            {
                                tittel: 'Har du søkt om andre trygdeytelser som ikke er behandlet?',
                                verdi:
                                    props.behandling.søknad.søknadInnhold.inntektOgPensjon.søktAndreYtelserIkkeBehandletBegrunnelse?.toString() ??
                                    'Nei',
                            },
                            {
                                tittel: 'Har du mottatt sosialstønad i løpet av de siste tre måneder?',
                                verdi:
                                    props.behandling.søknad.søknadInnhold.inntektOgPensjon.sosialstønadBeløp?.toString() ??
                                    'Nei',
                            },
                            {
                                tittel: 'Har du trygdeytelser i utlandet?',
                                verdi:
                                    props.behandling.søknad.søknadInnhold.inntektOgPensjon.tjenerPengerIUtlandetBeløp?.toString() ??
                                    'Nei',
                            },
                            {
                                tittel: 'Har du tjenestepensjon og/eller pensjonssparing?',
                                verdi:
                                    props.behandling.søknad.søknadInnhold.inntektOgPensjon.trygdeytelserIUtlandet?.toString() ??
                                    'Nei',
                            },
                        ]}
                    />
                ),
            }}
        </Vurdering>
    );
};

export default Beregning;
