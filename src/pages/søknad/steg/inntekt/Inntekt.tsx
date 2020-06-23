import * as React from 'react';
import { Input } from 'nav-frontend-skjema';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useFormik } from 'formik';
import { useHistory } from 'react-router-dom';
import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknadSlice';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import { Nullable } from '../../../../lib/types';
import messages from './inntekt-nb';
import { Feiloppsummering } from 'nav-frontend-skjema';
import yup, { formikErrorsTilFeiloppsummering, formikErrorsHarFeil } from '~lib/validering';
import sharedI18n from '../steg-shared-i18n';
import { useI18n } from '../../../../lib/hooks';
import { Knapp } from 'nav-frontend-knapper';
import Lenke from 'nav-frontend-lenker';

interface FormData {
    harInntekt: Nullable<boolean>;
    inntektBeløp: Nullable<number>;
    harMottattSosialstønad: Nullable<boolean>;
    mottarPensjon: Nullable<boolean>;
    pensjonsInntekt: Array<{ ordning: string; beløp: string }>;
}

const schema = yup.object<FormData>({
    harInntekt: yup.boolean().nullable().required(),
    inntektBeløp: yup
        .number()
        .nullable(true)
        .defined()
        .label('Inntekt')
        .when('harInntekt', {
            is: true,
            then: yup.number().typeError('Inntekt må være et tall').positive().required(),
            otherwise: yup.number().nullable().default(null),
        }),
    harMottattSosialstønad: yup.boolean().nullable().required(),
    mottarPensjon: yup.boolean().nullable().required(),
    pensjonsInntekt: yup
        .array(
            yup
                .object({
                    ordning: yup.string().required(),
                    beløp: (yup
                        .number()
                        .defined()
                        .label('Pensjonsinntekt')
                        .typeError('Pensjonsinntekt må et være tall')
                        .positive()
                        .required()
                        .moreThan(0) as unknown) as yup.Schema<string>,
                })
                .required()
        )
        .defined()
        .when('mottarPensjon', {
            is: true,
            then: yup.array().min(0).required(),
            otherwise: yup.array().max(0),
        }),
});

const DinInntekt = (props: { forrigeUrl: string; nesteUrl: string }) => {
    const inntektFraStore = useAppSelector((s) => s.soknad.inntekt);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);

    const formik = useFormik<FormData>({
        initialValues: {
            harInntekt: inntektFraStore.harInntekt,
            inntektBeløp: inntektFraStore.inntektBeløp,
            harMottattSosialstønad: inntektFraStore.harMottattSosialstønad,
            mottarPensjon: inntektFraStore.mottarPensjon,
            pensjonsInntekt: inntektFraStore.pensjonsInntekt,
        },
        onSubmit: (values) => {
            save(values);
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const save = (values: FormData) =>
        dispatch(
            søknadSlice.actions.inntektUpdated({
                harInntekt: values.harInntekt,
                inntektBeløp: values.inntektBeløp,
                harMottattSosialstønad: values.harMottattSosialstønad,
                mottarPensjon: values.mottarPensjon,
                pensjonsInntekt: values.pensjonsInntekt,
            })
        );

    const pensjonsInntekter = () => {
        return (
            <div>
                {formik.values.pensjonsInntekt.map((item: { ordning: string; beløp: string }, index: number) => (
                    <div className={sharedStyles.inputFelterDiv} key={index}>
                        <Input
                            className={sharedStyles.inputFelt}
                            label={<FormattedMessage id="input.pensjonsOrdning.label" />}
                            value={item.ordning}
                            onChange={(e) =>
                                formik.setValues({
                                    ...formik.values,
                                    pensjonsInntekt: formik.values.pensjonsInntekt.map((i, idx) =>
                                        idx === index ? { ordning: e.target.value, beløp: item.beløp } : i
                                    ),
                                })
                            }
                        />
                        <Input
                            className={sharedStyles.inputFelt}
                            label={<FormattedMessage id="input.pensjonsBeløp.label" />}
                            value={item.beløp}
                            onChange={(e) =>
                                formik.setValues({
                                    ...formik.values,
                                    pensjonsInntekt: formik.values.pensjonsInntekt.map((i, idx) =>
                                        idx === index ? { ordning: item.ordning, beløp: e.target.value } : i
                                    ),
                                })
                            }
                        />
                        {formik.values.pensjonsInntekt.length > 1 && (
                            <Lenke
                                href="#"
                                className={sharedStyles.fjernFeltLink}
                                onClick={(e) => {
                                    e.preventDefault();
                                    formik.setValues({
                                        ...formik.values,
                                        pensjonsInntekt: [
                                            ...formik.values.pensjonsInntekt.slice(0, index),
                                            ...formik.values.pensjonsInntekt.slice(index + 1),
                                        ],
                                    });
                                }}
                            >
                                Fjern felt
                            </Lenke>
                        )}
                    </div>
                ))}
                <div className={sharedStyles.leggTilFeltKnapp}>
                    <Knapp
                        onClick={(e) => {
                            e.preventDefault();
                            formik.setValues({
                                ...formik.values,
                                pensjonsInntekt: [...formik.values.pensjonsInntekt, { ordning: '', beløp: '' }],
                            });
                        }}
                    >
                        Legg til felt
                    </Knapp>
                </div>
            </div>
        );
    };

    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });

    return (
        <RawIntlProvider value={intl}>
            <div className={sharedStyles.container}>
                <form
                    onSubmit={(e) => {
                        setHasSubmitted(true);
                        formik.handleSubmit(e);
                    }}
                >
                    <div className={sharedStyles.formContainer}>
                        <JaNeiSpørsmål
                            id="harInntekt"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.harInntekt.label" />}
                            feil={formik.errors.harInntekt}
                            state={formik.values.harInntekt}
                            onChange={(val) =>
                                formik.setValues({
                                    ...formik.values,
                                    harInntekt: val,
                                })
                            }
                        />

                        {formik.values.harInntekt && (
                            <Input
                                id="inntektBeløp"
                                feil={formik.errors.inntektBeløp}
                                className={sharedStyles.sporsmal}
                                value={formik.values.inntektBeløp || ''}
                                label={<FormattedMessage id="input.inntekt.inntektBeløp" />}
                                onChange={formik.handleChange}
                            />
                        )}

                        <JaNeiSpørsmål
                            id="mottarPensjon"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.mottarPensjon.label" />}
                            feil={formik.errors.mottarPensjon}
                            state={formik.values.mottarPensjon}
                            onChange={(val) =>
                                formik.setValues({
                                    ...formik.values,
                                    mottarPensjon: val,
                                    pensjonsInntekt: val
                                        ? formik.values.pensjonsInntekt.length === 0
                                            ? [{ ordning: '', beløp: '' }]
                                            : formik.values.pensjonsInntekt
                                        : [],
                                })
                            }
                        />
                        {formik.values.mottarPensjon && pensjonsInntekter()}

                        <JaNeiSpørsmål
                            id="harMottattSosialstønad"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.harMottattSosialstønad.label" />}
                            feil={formik.errors.harMottattSosialstønad}
                            state={formik.values.harMottattSosialstønad}
                            onChange={(val) =>
                                formik.setValues({
                                    ...formik.values,
                                    harMottattSosialstønad: val,
                                })
                            }
                        />
                    </div>
                    <Feiloppsummering
                        className={sharedStyles.feiloppsummering}
                        tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                        feil={formikErrorsTilFeiloppsummering(formik.errors)}
                        hidden={!formikErrorsHarFeil(formik.errors)}
                    />

                    <Bunnknapper
                        previous={{
                            onClick: () => {
                                save(formik.values);
                                history.push(props.forrigeUrl);
                            },
                        }}
                    />
                </form>
            </div>
        </RawIntlProvider>
    );
};

export default DinInntekt;
