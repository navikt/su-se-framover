import * as DateFns from 'date-fns';
import { formatISO, lastDayOfMonth } from 'date-fns';
import { useFormik } from 'formik';
import { Knapp } from 'nav-frontend-knapper';
import Panel from 'nav-frontend-paneler';
import * as React from 'react';
import DatePicker from 'react-datepicker';

import { TrashBin } from '~assets/Icons';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import sharedI18n from '~pages/saksbehandling/steg/sharedI18n-nb';
import { UførhetInput } from '~pages/saksbehandling/steg/uførhet/UføreInput';
import messages from '~pages/saksbehandling/steg/uførhet/uførhet-nb';
import sharedStyles from '~pages/søknad/steg-shared.module.less';
import { Grunnlag } from '~types/Behandling';
import { Uføregrunnlag } from '~types/grunnlagsdata';

import styles from './Uførhet.module.less';

const UføregrunnlagInputFelter = (props: { grunnlag: Grunnlag; lagre: (uføregrunnlag: Uføregrunnlag[]) => void }) => {
    interface FormData {
        grunnlag: UføregrunnlagFormData[];
    }

    interface UføregrunnlagFormData {
        fraOgMed: Nullable<Date>;
        tilOgMed: Nullable<Date>;
        forventetInntekt: Nullable<string>;
        uføregrad: Nullable<string>;
    }

    const handleSave = async (values: FormData) => {
        const uføregrunnlag = values.grunnlag.map((uføregrunnlag) => ({
            periode: {
                fraOgMed: formatISO(uføregrunnlag.fraOgMed!, { representation: 'date' }),
                tilOgMed: formatISO(lastDayOfMonth(uføregrunnlag.tilOgMed!), { representation: 'date' }),
            },
            uføregrad: Number.parseInt(uføregrunnlag.uføregrad!),
            forventetInntekt: Number.parseInt(uføregrunnlag.forventetInntekt!),
        })) as Uføregrunnlag[];
        props.lagre(uføregrunnlag);
    };

    const handleRemove = async (index: number) => {
        formik.setValues((v) => ({
            ...v,
            grunnlag: formik.values.grunnlag.filter((_, idx) => idx !== index),
        }));
    };

    const formik = useFormik<FormData>({
        initialValues: {
            grunnlag: props.grunnlag.uføre.map((x) => ({
                fraOgMed: DateFns.parseISO(x.periode.fraOgMed),
                tilOgMed: DateFns.parseISO(x.periode.tilOgMed),
                uføregrad: String(x.uføregrad),
                forventetInntekt: String(x.forventetInntekt),
            })),
        },
        async onSubmit() {
            /**/
        },
        validateOnChange: false,
    });

    const byttDato = (
        keyNavn: keyof Pick<UføregrunnlagFormData, 'fraOgMed' | 'tilOgMed'>,
        inputdato: Date | [Date, Date] | null,
        currentIndex: number
    ) => {
        const dato = Array.isArray(inputdato) ? inputdato[0] : inputdato;
        formik.setValues({
            ...formik.values,
            grunnlag: formik.values.grunnlag.map((uføreGrunnlag, index) => {
                if (index !== currentIndex) return uføreGrunnlag;
                return {
                    ...uføreGrunnlag,
                    [keyNavn]: dato,
                };
            }),
        });
    };

    const leggTilNyRad = () => {
        const withNewRow = formik.values.grunnlag;
        withNewRow.push({
            fraOgMed: null,
            tilOgMed: null,
            forventetInntekt: null,
            uføregrad: null,
        });
        formik.setValues({ ...formik.values, grunnlag: withNewRow });
    };

    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });

    return (
        <div>
            {formik.values.grunnlag.map((input, idx) => {
                const feltId = (felt: keyof typeof input) => `[${idx}].${felt}`;
                const fraOgMed = feltId('fraOgMed');
                const tilOgMed = feltId('tilOgMed');
                const uføregrad = feltId('uføregrad');
                const forventetInntekt = feltId('forventetInntekt');

                return (
                    <Panel border className={styles.uføregrunnlagInputContainer} key={idx}>
                        <div className={styles.periode}>
                            <div className={styles.datoContainer}>
                                <label htmlFor={fraOgMed}>Fra og med</label>
                                <DatePicker
                                    id={fraOgMed}
                                    selected={input.fraOgMed}
                                    onChange={(dato) => byttDato('fraOgMed', dato, idx)}
                                    dateFormat="MM/yyyy"
                                    showMonthYearPicker
                                    isClearable
                                    selectsEnd
                                    startDate={input.fraOgMed}
                                    endDate={input.tilOgMed}
                                    minDate={new Date(2021, 0)}
                                    autoComplete="off"
                                    key={fraOgMed}
                                />
                            </div>
                            <div className={styles.datoContainer}>
                                <label htmlFor={tilOgMed}>Til og med</label>
                                <DatePicker
                                    id={tilOgMed}
                                    selected={input.tilOgMed}
                                    onChange={(dato) => byttDato('tilOgMed', dato, idx)}
                                    dateFormat="MM/yyyy"
                                    showMonthYearPicker
                                    isClearable
                                    selectsEnd
                                    startDate={input.fraOgMed}
                                    endDate={input.tilOgMed}
                                    minDate={new Date(2021, 0)}
                                    autoComplete="off"
                                    key={tilOgMed}
                                />
                            </div>
                        </div>
                        <div className={styles.uføre}>
                            <UførhetInput
                                tittel={intl.formatMessage({ id: 'input.label.uføregrad' })}
                                inputName={uføregrad}
                                inputTekst="%"
                                bredde="XS"
                                value={input.uføregrad ?? ''}
                                onChange={(event) => {
                                    formik.setValues({
                                        ...formik.values,
                                        grunnlag: formik.values.grunnlag.map((uføreGrunnlag, index) => {
                                            if (idx !== index) return uføreGrunnlag;
                                            return {
                                                ...formik.values.grunnlag[idx],
                                                uføregrad: event.target.value,
                                            };
                                        }),
                                    });
                                }}
                                feil={undefined}
                                key={uføregrad}
                            />
                            <UførhetInput
                                tittel={intl.formatMessage({ id: 'input.label.forventetInntekt' })}
                                inputName={forventetInntekt}
                                inputTekst="NOK"
                                bredde="L"
                                value={input.forventetInntekt ?? ''}
                                onChange={(event) => {
                                    formik.setValues({
                                        ...formik.values,
                                        grunnlag: formik.values.grunnlag.map((uføreGrunnlag, index) => {
                                            if (idx !== index) return uføreGrunnlag;
                                            return {
                                                ...formik.values.grunnlag[idx],
                                                forventetInntekt: event.target.value,
                                            };
                                        }),
                                    });
                                }}
                                feil={undefined}
                                key={forventetInntekt}
                            />
                            <Knapp
                                className={styles.søppelbøtteContainer}
                                htmlType={'button'}
                                onClick={() => {
                                    handleRemove(idx);
                                }}
                            >
                                <TrashBin width={'10'} height={'10'} />
                            </Knapp>
                        </div>
                    </Panel>
                );
            })}
            <div className={sharedStyles.leggTilFeltKnapp}>
                <Knapp onClick={leggTilNyRad} htmlType="button">
                    Legg til
                </Knapp>
            </div>
            <div className={sharedStyles.leggTilFeltKnapp}>
                <Knapp onClick={() => handleSave(formik.values)} htmlType="button">
                    Lagre
                </Knapp>
            </div>
        </div>
    );
};

export default UføregrunnlagInputFelter;
