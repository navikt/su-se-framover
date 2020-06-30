import * as React from 'react';
import { useFormik } from 'formik';
import { Input, SkjemaGruppe, Feiloppsummering } from 'nav-frontend-skjema';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import nb from './inngang-nb';
import styles from './inngang.module.less';
import { useHistory } from 'react-router-dom';
import yup, { formikErrorsTilFeiloppsummering, formikErrorsHarFeil } from '~lib/validering';
import sharedI18n from '../steg-shared-i18n';
import { useI18n } from '../../../../lib/hooks';
import sharedStyles from '../../steg-shared.module.less';
import * as personSlice from '~features/person/person.slice';
import * as RemoteData from '@devexperts/remote-data-ts';

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
            dispatch(personSlice.fetchPerson({ fnr: formik.values.fnr }));
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);

    const handleNyttSøkClick = () => {
        setHasSubmitted(false);
        formik.resetForm();
        dispatch(personSlice.default.actions.resetSøker());
    };
    const handleStarClick = () => {
        if (søker) {
            history.push(props.nesteUrl);
        }
    };

    return (
        <RawIntlProvider value={intl}>
            <div className={sharedStyles.container}>
                {!RemoteData.isSuccess(søker) ? (
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
                        <SkjemaGruppe className={styles.inputs}>
                            <Input
                                id="fnr"
                                name="fnr"
                                label={<FormattedMessage id={'input.fnr.label'} />}
                                onChange={formik.handleChange}
                                value={formik.values.fnr}
                                feil={formik.errors.fnr}
                            />
                        </SkjemaGruppe>

                        <Feiloppsummering
                            className={sharedStyles.feiloppsummering}
                            tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                            feil={formikErrorsTilFeiloppsummering(formik.errors)}
                            hidden={!formikErrorsHarFeil(formik.errors)}
                            innerRef={feiloppsummeringref}
                        />

                        <Hovedknapp htmlType="submit" spinner={RemoteData.isPending(søker)}>
                            <FormattedMessage id="knapp.hentSøker" />
                        </Hovedknapp>
                    </form>
                ) : (
                    <div>
                        <div className={styles.sokerinfo}>
                            <div>
                                <span className={styles.sokerinfoLabel}>
                                    <FormattedMessage id="sokerinfo.fornavn.label" />
                                </span>
                                <span>{søker.value.fornavn}</span>
                            </div>
                            <div>
                                <span className={styles.sokerinfoLabel}>
                                    <FormattedMessage id="sokerinfo.etternavn.label" />
                                </span>
                                <span>{søker.value.etternavn}</span>
                            </div>
                            <div>
                                <span className={styles.sokerinfoLabel}>
                                    <FormattedMessage id="sokerinfo.fnr.label" />
                                </span>
                                <span>{søker.value.fnr}</span>
                            </div>
                        </div>
                        <div className={styles.successknapper}>
                            <Knapp htmlType="button" onClick={handleNyttSøkClick}>
                                <FormattedMessage id="knapp.nyttSøk" />
                            </Knapp>
                            <Hovedknapp htmlType="button" className={styles.submitknapp} onClick={handleStarClick}>
                                <FormattedMessage id="knapp.startSøknad" />
                            </Hovedknapp>
                        </div>
                    </div>
                )}
            </div>
        </RawIntlProvider>
    );
};

export default index;
