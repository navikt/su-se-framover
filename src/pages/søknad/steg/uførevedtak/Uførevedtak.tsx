import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Feiloppsummering } from 'nav-frontend-skjema';
import * as React from 'react';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { JaNeiSpørsmål } from '~/components/FormElements';
import søknadSlice from '~/features/søknad/søknad.slice';
import { Nullable } from '~lib/types';
import yup, { formikErrorsTilFeiloppsummering, formikErrorsHarFeil } from '~lib/validering';
import { useAppSelector, useAppDispatch } from '~redux/Store';

import { useI18n } from '../../../../lib/hooks';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

import messages from './uførevedtak-nb';

interface FormData {
    harUførevedtak: Nullable<boolean>;
}

const schema = yup.object<FormData>({
    harUførevedtak: yup.boolean().nullable().required(),
});

const Uførevedtak = (props: { forrigeUrl: string; nesteUrl: string }) => {
    const harVedtakFraStore = useAppSelector((s) => s.soknad.harUførevedtak);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const formik = useFormik<FormData>({
        initialValues: {
            harUførevedtak: harVedtakFraStore,
        },
        onSubmit: (values) => {
            dispatch(søknadSlice.actions.harUførevedtakUpdated(values.harUførevedtak));
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
    });

    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);

    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });

    return (
        <div className={sharedStyles.container}>
            <RawIntlProvider value={intl}>
                <form
                    onSubmit={(e) => {
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
                            id="harUførevedtak"
                            legend={<FormattedMessage id="input.uforevedtak.label" />}
                            feil={formik.errors.harUførevedtak}
                            state={formik.values.harUførevedtak}
                            onChange={(e) =>
                                formik.setValues({
                                    ...formik.values,
                                    harUførevedtak: e,
                                })
                            }
                        />
                    </div>
                    {formik.values.harUførevedtak === false && (
                        <AlertStripe type="advarsel" className={sharedStyles.marginBottom}>
                            Du kan fremdeles søke, men du vil sannsynligvis få avslag. Du må søke om uføre og motta
                            vedtak før du kan søke om supplerende stønad for uføre
                        </AlertStripe>
                    )}
                    <div>
                        <Feiloppsummering
                            className={sharedStyles.marginBottom}
                            tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                            feil={formikErrorsTilFeiloppsummering(formik.errors)}
                            hidden={!formikErrorsHarFeil(formik.errors)}
                            innerRef={feiloppsummeringref}
                        />
                    </div>

                    <Bunnknapper
                        previous={{
                            onClick: () => {
                                dispatch(søknadSlice.actions.harUførevedtakUpdated(formik.values.harUførevedtak));
                                history.push(props.forrigeUrl);
                            },
                        }}
                    />
                </form>
            </RawIntlProvider>
        </div>
    );
};

export default Uførevedtak;
