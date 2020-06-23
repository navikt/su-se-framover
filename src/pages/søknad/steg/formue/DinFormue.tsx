import * as React from 'react';
import { Input } from 'nav-frontend-skjema';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useFormik } from 'formik';
import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknadSlice';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import messages from './dinformue-nb';
import { Nullable } from '~lib/types';
import { useHistory } from 'react-router-dom';
import { Feiloppsummering } from 'nav-frontend-skjema';
import yup, { formikErrorsTilFeiloppsummering, formikErrorsHarFeil } from '~lib/validering';
import { useI18n } from '~lib/hooks';
import sharedI18n from '../steg-shared-i18n';

interface FormData {
    harFormue: Nullable<boolean>;
    beløpFormue: Nullable<string>;
    eierBolig: Nullable<boolean>;
    harDepositumskonto: Nullable<boolean>;
}

const schema = yup.object<FormData>({
    harFormue: yup.boolean().nullable().required(),
    beløpFormue: yup
        .number()
        .nullable()
        .defined()
        .when('harFormue', {
            is: true,
            then: yup
                .number()
                .typeError('Formue beløp må være et tall')
                .label('Formue beløp')
                .nullable(false)
                .positive(),
            otherwise: yup.number(),
        }) as yup.Schema<Nullable<string>>,
    eierBolig: yup.boolean().nullable().required(),
    harDepositumskonto: yup.boolean().nullable().required(),
});

const DinFormue = (props: { forrigeUrl: string; nesteUrl: string }) => {
    const formueFraStore = useAppSelector((s) => s.soknad.formue);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);

    const save = (values: FormData) => {
        dispatch(
            søknadSlice.actions.formueUpdated({
                harFormue: values.harFormue,
                beløpFormue: values.harFormue && values.beløpFormue ? Number.parseFloat(values.beløpFormue) : null,
                eierBolig: values.eierBolig,
                harDepositumskonto: values.harDepositumskonto,
            })
        );
    };

    const formik = useFormik<FormData>({
        initialValues: {
            harFormue: formueFraStore.harFormue,
            beløpFormue: formueFraStore.beløpFormue?.toString() ?? '',
            eierBolig: formueFraStore.eierBolig,
            harDepositumskonto: formueFraStore.harDepositumskonto,
        },
        onSubmit: (values) => {
            save(values);
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });

    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);

    return (
        <div className={sharedStyles.container}>
            <RawIntlProvider value={intl}>
                <form
                    onSubmit={(e) => {
                        setHasSubmitted(true);
                        formik.handleSubmit(e);
                        setTimeout(() => {
                            if (feiloppsummeringref.current) {
                                feiloppsummeringref.current.focus();
                            }
                        }, 0);
                    }}
                >
                    <div className={sharedStyles.formContainer}>
                        <JaNeiSpørsmål
                            id="harFomue"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.harFormue.label" />}
                            feil={null}
                            state={formik.values.harFormue}
                            onChange={(e) =>
                                formik.setValues({
                                    ...formik.values,
                                    harFormue: e,
                                })
                            }
                        />

                        {formik.values.harFormue && (
                            <Input
                                id="beløpFormue"
                                className={sharedStyles.sporsmal}
                                value={formik.values.beløpFormue ?? ''}
                                label={<FormattedMessage id="input.oppgiBeløp.label" />}
                                onChange={formik.handleChange}
                            />
                        )}

                        <JaNeiSpørsmål
                            id="eierBolig"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.eierDuBolig.label" />}
                            feil={null}
                            state={formik.values.eierBolig}
                            onChange={(e) =>
                                formik.setValues({
                                    ...formik.values,
                                    eierBolig: e,
                                })
                            }
                        />
                        <JaNeiSpørsmål
                            id="depositumskonto"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.depositumskonto.label" />}
                            feil={null}
                            state={formik.values.harDepositumskonto}
                            onChange={(e) =>
                                formik.setValues({
                                    ...formik.values,
                                    harDepositumskonto: e,
                                })
                            }
                        />
                    </div>
                    <Feiloppsummering
                        className={sharedStyles.feiloppsummering}
                        tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                        feil={formikErrorsTilFeiloppsummering(formik.errors)}
                        hidden={!formikErrorsHarFeil(formik.errors)}
                        innerRef={feiloppsummeringref}
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
            </RawIntlProvider>
        </div>
    );
};

export default DinFormue;
