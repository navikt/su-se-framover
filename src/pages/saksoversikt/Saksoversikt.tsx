import React from 'react';
import { IntlProvider } from 'react-intl';
import { Route, useHistory, useParams, useRouteMatch, Switch } from 'react-router-dom';
import AlertStripe from 'nav-frontend-alertstriper';

import { PersonCard } from '@navikt/nap-person-card';
import { Header } from '@navikt/nap-header';
import SideMenu from '@navikt/nap-side-menu';

import NavFrontendSpinner from 'nav-frontend-spinner';

import { Languages } from '~components/TextProvider';
import { useAppSelector } from '~redux/Store';

import messages from './saksoversikt-nb';
import Søkefelt from './søkefelt/Søkefelt';
import Vilkår from './vilkår/Vilkår';
import { SaksbehandligMenyValg } from './types';
import styles from './saksoversikt.module.less';

const Saksoversikt = () => {
    const { meny } = useParams<{ meny: SaksbehandligMenyValg }>();
    const { path } = useRouteMatch();
    const { pending, søker, error } = useAppSelector((s) => s.søker);
    const history = useHistory();

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
            <Header title="Supplerende stønad Ufør" titleHref={'/'}>
                <div className={styles.headerContainer}>
                    <Søkefelt />
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
                    <div className={styles.container}>
                        <SideMenu
                            links={[
                                {
                                    label: 'Sak',
                                    active: meny === undefined,
                                },
                                {
                                    label: 'Søknad',
                                    active: meny === SaksbehandligMenyValg.Søknad,
                                },
                                {
                                    label: 'Vilkår',
                                    active: meny === SaksbehandligMenyValg.Vilkår,
                                },
                                {
                                    label: 'Behandlig',
                                    active: meny === SaksbehandligMenyValg.Behandlig,
                                },
                                {
                                    label: 'Vedtak',
                                    active: meny === SaksbehandligMenyValg.Vedtak,
                                },
                            ]}
                            onClick={(index) => {
                                switch (index) {
                                    case 0:
                                        history.push(`/saksoversikt`);
                                        return;
                                    case 1:
                                        history.push(`/saksoversikt/soknad`);
                                        return;
                                    case 2:
                                        history.push(`/saksoversikt/vilkar`);
                                        return;
                                    case 3:
                                        history.push(`/saksoversikt/behandling`);
                                        return;
                                    case 4:
                                        history.push(`/saksoversikt/vedtak`);
                                        return;
                                }
                            }}
                        />
                        <div>
                            <Switch>
                                <Route path={`${path}/${SaksbehandligMenyValg.Søknad}`}>soknad</Route>
                                <Route path={`${path}/${SaksbehandligMenyValg.Vilkår}`}>
                                    <Vilkår />
                                </Route>
                                <Route path={`${path}/${SaksbehandligMenyValg.Behandlig}`}>behandling</Route>
                                <Route path={`${path}/${SaksbehandligMenyValg.Vedtak}`}>vedtak</Route>
                                <Route path={path}>Sak</Route>
                            </Switch>
                        </div>
                    </div>
                </>
            )}
        </IntlProvider>
    );
};

export default Saksoversikt;
