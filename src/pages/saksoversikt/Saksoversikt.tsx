import React from 'react';
import { IntlProvider } from 'react-intl';
import AlertStripe from 'nav-frontend-alertstriper';

import { PersonCard } from '@navikt/nap-person-card';
import { Header } from '@navikt/nap-header';

import NavFrontendSpinner from 'nav-frontend-spinner';

import { Languages } from '~components/TextProvider';

import messages from './saksoversikt-nb';
import { useAppSelector, useAppDispatch } from '~redux/Store';

import * as personSlice from '~features/person/person.slice';
import { Input } from 'nav-frontend-skjema';

import styles from './saksoversikt.module.less';

const Saksoversikt = () => {
    const { pending, søker, error } = useAppSelector((s) => s.søker);
    const dispatch = useAppDispatch();

<<<<<<< HEAD
    const formik = useFormik<FormData>({
        initialValues: {
            fnr: '',
        },
        onSubmit: async (values) => {
            await dispatch(sakSlice.fetchSak({ fnr: values.fnr }));
        },
    });

=======
>>>>>>> 2a16f4b... Legg til ny menylinje, søk og vis personalia
    return (
        <IntlProvider locale={Languages.nb} messages={messages}>
            <Header title="Supplerende stønad Ufør" titleHref={'#'}>
                <div className={styles.headerContainer}>
                    <Input
                        className={styles.search}
                        name="fnr"
                        placeholder="Fødselsnummer"
                        maxLength={11}
                        onChange={(e) => {
                            if (e.target.value.length === 11) {
                                dispatch(personSlice.fetchPerson({ fnr: e.target.value }));
                            }
                        }}
                        mini
                    />
                </div>
            </Header>

            {pending && <NavFrontendSpinner />}
            {error && <AlertStripe type="feil">{error.message}</AlertStripe>}
            {søker && (
                <>
                    <PersonCard
                        fodselsnummer={søker.fnr}
                        gender="unknown"
                        name={`${søker.fornavn} ${søker.etternavn}`}
                        isActive
                    />
                </>
            )}
        </IntlProvider>
    );
};

export default Saksoversikt;
