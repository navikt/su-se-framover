import * as React from 'react';
import { useFormik } from 'formik';
import { Input, SkjemaGruppe, Feiloppsummering } from 'nav-frontend-skjema';
import { Hovedknapp } from 'nav-frontend-knapper';
import { useAppDispatch } from '~redux/Store';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import nb from './inngang-nb';
import * as saksoversiktSlice from '../../../../features/saksoversikt/saksoversikt.slice';
import styles from './inngang.module.less';
import { useHistory } from 'react-router-dom';
import yup, { formikErrorsTilFeiloppsummering, formikErrorsHarFeil } from '~lib/validering';
import sharedI18n from '../steg-shared-i18n';
import { useI18n } from '../../../../lib/hooks';
import sharedStyles from '../../steg-shared.module.less';

interface FormData {
    navn: string;
    fnr: string;
}

const index = (props: { nesteUrl: string }) => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);

    const intl = useI18n({ messages: { ...sharedI18n, ...nb } });

    const schema = yup.object<FormData>({
        fnr: yup
            .string()
            .length(11)
            .label(intl.formatMessage({ id: 'input.fnr.label' }))
            .required(),
        navn: yup
            .string()
            .min(1)
            .label(intl.formatMessage({ id: 'input.navn.label' }))
            .required()
    });

    const formik = useFormik<FormData>({
        initialValues: {
            fnr: '',
            navn: ''
        },
        onSubmit: async values => {
            await dispatch(saksoversiktSlice.fetchSøker({ fnr: values.fnr, access_token: '123' }));
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted
    });

    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);

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
                    <SkjemaGruppe className={styles.inputs}>
                        <Input
                            id="fnr"
                            name="fnr"
                            label={<FormattedMessage id={'input.fnr.label'} />}
                            onChange={formik.handleChange}
                            value={formik.values.fnr}
                            feil={formik.errors.fnr}
                        />
                        <Input
                            id="navn"
                            name="navn"
                            label={<FormattedMessage id={'input.navn.label'} />}
                            onChange={formik.handleChange}
                            feil={formik.errors.navn}
                        />
                    </SkjemaGruppe>

                    <Feiloppsummering
                        className={sharedStyles.feiloppsummering}
                        tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                        feil={formikErrorsTilFeiloppsummering(formik.errors)}
                        hidden={!formikErrorsHarFeil(formik.errors)}
                        innerRef={feiloppsummeringref}
                    />

                    <Hovedknapp htmlType="submit" disabled={formik.isSubmitting} className={styles.submitknapp}>
                        <FormattedMessage id={'knapp.neste'} />
                    </Hovedknapp>
                </form>
            </div>
        </RawIntlProvider>
    );
};

export default index;
