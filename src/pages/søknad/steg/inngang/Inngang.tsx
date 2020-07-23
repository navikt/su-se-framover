import * as React from 'react';
import { useFormik } from 'formik';
import { Input, Feiloppsummering } from 'nav-frontend-skjema';
import { Hovedknapp } from 'nav-frontend-knapper';
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
import NavFrontendSpinner from 'nav-frontend-spinner';

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

    //TODO: fiks type
    const Personkort = (RemoteDataSøker: any) => {
        const { søker } = RemoteDataSøker;
        return (
            <div className={styles.personkortContainer}>
                <div>
                    <span> 🤪 &nbsp;</span>
                </div>
                <div>
                    <p>{`${søker.value.fornavn} ${søker.value.mellomnavn} ${søker.value.etternavn}`}</p>
                    <div>
                        <span>{`${søker.value.fnr} -`}</span>
                        <span>{`${søker.value.fnr.substring(0, 2)}.`}</span>
                        <span>{`${søker.value.fnr.substring(2, 4)}.`}</span>
                        <span>{`${søker.value.fnr.substring(4, 6)}`}</span>
                    </div>
                </div>
            </div>
        );
        /*
            mulighet for å endre det eksisterende personkortet på en eller annen måte?
            <PersonCard
                fodselsnummer={søker.value.fnr}
                gender="unknown"
                name={`${søker.value.fornavn} ${søker.value.mellomnavn} ${søker.value.etternavn}`}
            />
        */
    };
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
                            className={styles.fnrInput}
                            label={<FormattedMessage id={'input.fnr.label'} />}
                            onChange={formik.handleChange}
                            value={formik.values.fnr}
                            feil={formik.errors.fnr}
                        />
                        {RemoteData.isPending(søker) && <NavFrontendSpinner />}
                        {RemoteData.isSuccess(søker) && <Personkort søker={søker} />}
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
