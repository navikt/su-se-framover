import * as React from 'react';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useFormik } from 'formik';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknad.slice';
import messages from './uførevedtak-nb';
import sharedStyles from '../../steg-shared.module.less';
import { Nullable } from '~lib/types';
import { Feiloppsummering } from 'nav-frontend-skjema';
import yup, { formikErrorsTilFeiloppsummering, formikErrorsHarFeil } from '~lib/validering';
import { useHistory } from 'react-router-dom';
import sharedI18n from '../steg-shared-i18n';
import { useI18n } from '../../../../lib/hooks';

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
                    <div>
                        <Feiloppsummering
                            className={sharedStyles.feiloppsummering}
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
