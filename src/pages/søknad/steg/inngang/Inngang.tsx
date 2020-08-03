import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import { Hovedknapp } from 'nav-frontend-knapper';
import { Input, Feiloppsummering } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import * as React from 'react';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { Personkort } from '~components/Personkort';
import * as personSlice from '~features/person/person.slice';
import yup, { formikErrorsTilFeiloppsummering, formikErrorsHarFeil } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import { useI18n } from '../../../../lib/hooks';
import sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

import nb from './inngang-nb';
import styles from './inngang.module.less';

interface FormData {
    fnr: string;
}

const index = (props: { nesteUrl: string }) => {
    const { søker } = useAppSelector((s) => s.søker);
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
    });

    const formik = useFormik<FormData>({
        initialValues: {
            fnr: '',
        },
        onSubmit: async () => {
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (formik.values.fnr.length === 11) {
            dispatch(personSlice.fetchPerson({ fnr: formik.values.fnr }));
        } else if (formik.values.fnr.length !== 11 && søker) {
            dispatch(personSlice.default.actions.resetSøker());
        }
    }, [formik.values.fnr]);

    return (
        <RawIntlProvider value={intl}>
            <div className={sharedStyles.container}>
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
                    <div className={styles.inputContainer}>
                        <Input
                            id="fnr"
                            name="fnr"
                            label={<FormattedMessage id={'input.fnr.label'} />}
                            onChange={formik.handleChange}
                            value={formik.values.fnr}
                            feil={formik.errors.fnr}
                        />
                        {RemoteData.isPending(søker) && <NavFrontendSpinner />}
                        {RemoteData.isSuccess(søker) && (
                            <div className={styles.personkortWrapper}>
                                <Personkort person={søker.value} />
                            </div>
                        )}
                    </div>

                    <Feiloppsummering
                        className={styles.feiloppsummering}
                        tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                        feil={formikErrorsTilFeiloppsummering(formik.errors)}
                        hidden={!formikErrorsHarFeil(formik.errors)}
                        innerRef={feiloppsummeringref}
                    />
                    <div className={styles.successknapper}>
                        <Hovedknapp>
                            <FormattedMessage id="knapp.startSøknad" />
                        </Hovedknapp>
                    </div>
                </form>
            </div>
        </RawIntlProvider>
    );
};

export default index;
