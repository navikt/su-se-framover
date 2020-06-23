import * as React from 'react';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useFormik } from 'formik';
import { Feiloppsummering } from 'nav-frontend-skjema';
import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknadSlice';
import messages from './flyktningstatus-oppholdstillatelse-nb';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import { Nullable } from '~lib/types';
import yup, { formikErrorsTilFeiloppsummering, formikErrorsHarFeil } from '~lib/validering';
import { useHistory } from 'react-router-dom';
import sharedI18n from '../steg-shared-i18n';
import { useI18n } from '../../../../lib/hooks';

interface FormData {
    erFlyktning: Nullable<boolean>;
    harOppholdstillatelse: Nullable<boolean>;
}

const schema = yup.object<FormData>({
    erFlyktning: yup
        .boolean()
        .nullable()
        .required(),
    harOppholdstillatelse: yup
        .boolean()
        .nullable()
        .required()
});

const FlyktningstatusOppholdstillatelse = (props: { forrigeUrl: string; nesteUrl: string }) => {
    const flyktningstatusFraStore = useAppSelector(s => s.soknad.flyktningstatus);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);

    const save = (values: FormData) =>
        dispatch(
            søknadSlice.actions.flyktningstatusUpdated({
                erFlyktning: values.erFlyktning,
                harOppholdstillatelse: values.harOppholdstillatelse
            })
        );

    const formik = useFormik<FormData>({
        initialValues: {
            erFlyktning: flyktningstatusFraStore.erFlyktning,
            harOppholdstillatelse: flyktningstatusFraStore.harOppholdstillatelse
        },
        onSubmit: values => {
            save(values);
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted
    });

    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);

    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });

    return (
        <RawIntlProvider value={intl}>
            <div className={sharedStyles.container}>
                <form
                    onSubmit={e => {
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
                            id={'erFlyktning'}
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.flyktning.label" />}
                            feil={formik.errors.erFlyktning}
                            state={formik.values.erFlyktning}
                            onChange={val =>
                                formik.setValues({
                                    ...formik.values,
                                    erFlyktning: val
                                })
                            }
                        />
                        <JaNeiSpørsmål
                            id={'harOppholdstillatelse'}
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.oppholdstillatelse.label" />}
                            feil={formik.errors.harOppholdstillatelse}
                            state={formik.values.harOppholdstillatelse}
                            onChange={val =>
                                formik.setValues({
                                    ...formik.values,
                                    harOppholdstillatelse: val
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
                            }
                        }}
                    />
                </form>
            </div>
        </RawIntlProvider>
    );
};

export default FlyktningstatusOppholdstillatelse;
