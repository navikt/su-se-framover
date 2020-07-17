import { hot } from 'react-hot-loader';
import React, { useEffect, useState } from 'react';
import { Innholdstittel } from 'nav-frontend-typografi';
import ErrorBoundary from './components/ErrorBoundary';

import { BrowserRouter as Router, Switch, Route, useLocation, useHistory, useRouteMatch } from 'react-router-dom';
import { Provider } from 'react-redux';
import Store from './redux/Store';
import Soknad from './pages/søknad';
import apiClient from '~/api/apiClient';
import * as Cookies from './lib/cookies';
import HomePage from '~pages/HomePage';
import Saksoversikt from '~pages/saksoversikt/Saksoversikt';
import NavFrontendSpinner from 'nav-frontend-spinner';
import Lenke from 'nav-frontend-lenker';
import styles from './root.module.less';
import Menyknapp from './components/Menyknapp';
import Header from '@navikt/nap-header';
import * as routes from './lib/routes';
import './externalStyles';

const Root = () => {
    return (
        <Provider store={Store}>
            <ErrorBoundary>
                <Router>
                    <ContentWrapper>
                        <Switch>
                            <Route exact path={routes.home.path}>
                                <HomePage />
                            </Route>
                            <Route path={routes.soknad.path}>
                                <Soknad />
                            </Route>

                            <Route path={routes.saksoversikt.path}>
                                <Saksoversikt />
                            </Route>
                            <Route>404</Route>
                        </Switch>
                    </ContentWrapper>
                </Router>
            </ErrorBoundary>
        </Provider>
    );
};

type LoginState = 'logging-in' | 'logged-in' | 'unauthorized' | 'error';

function ContentWrapper({ children }: { children: React.ReactChild }) {
    const [configLoaded, setConfigLoaded] = useState(window.BASE_URL && typeof window.BASE_URL === 'string');
    const authCompleteRouteMatch = useRouteMatch('/auth/complete');
    const [loginState, setLoginState] = useState<LoginState>('logging-in');
    const navn = Cookies.getNameFromAccessToken();

    const hasBaseUrl = window.BASE_URL && typeof window.BASE_URL === 'string';

    useEffect(() => {
        if (!hasBaseUrl) {
            fetch('/config.json').then((res) => {
                if (res.ok) {
                    res.json().then((config) => {
                        window.BASE_URL = config.suSeBakoverUrl;
                        setConfigLoaded(true);
                    });
                } else {
                    console.error('klarte ikke hente config.json', res.statusText);
                }
            });
        } else {
            setConfigLoaded(true);
        }
    }, [window.BASE_URL]);

    useEffect(() => {
        if (authCompleteRouteMatch || !configLoaded || !hasBaseUrl) {
            return;
        }

        apiClient({ url: '/authenticated', method: 'GET' }).then((res) => {
            if (res.status === 'ok') {
                return setLoginState('logged-in');
            }
            if (res.error.statusCode === 401 || res.error.statusCode === 403) {
                return setLoginState('unauthorized');
            }

            setLoginState('error');
        });
    }, [configLoaded]);

    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        if (authCompleteRouteMatch) {
            const tokens = location.hash.split('#');
            const accessToken = tokens[1];
            const refreshToken = tokens[2];
            if (!accessToken || !refreshToken) {
                console.error('On /auth/complete but no accesstoken/refreshtoken found');
            }
            Cookies.set(Cookies.CookieName.AccessToken, accessToken);
            Cookies.set(Cookies.CookieName.RefreshToken, refreshToken);
            history.push('/');
        }
    }, [authCompleteRouteMatch]);

    return (
        <div>
            <Header title="Supplerende stønad Ufør" titleHref={'/'}>
                {navn && (
                    <Menyknapp
                        navn={navn}
                        onLoggUtClick={() => {
                            Cookies.remove(Cookies.CookieName.AccessToken);
                            Cookies.remove(Cookies.CookieName.RefreshToken);
                            window.location.reload();
                        }}
                    />
                )}
            </Header>
            <div className={styles.contentContainer}>
                {loginState === 'logging-in' ? (
                    <NavFrontendSpinner />
                ) : loginState === 'unauthorized' ? (
                    <div className={styles.ikkeTilgangContainer}>
                        <Innholdstittel className={styles.overskrift}>Ikke tilgang</Innholdstittel>
                        <Lenke href={`${window.BASE_URL}/login`}>Logg inn på nytt</Lenke>
                    </div>
                ) : loginState === 'error' ? (
                    <div className={styles.ikkeTilgangContainer}>
                        <Innholdstittel className={styles.overskrift}>En feil oppstod</Innholdstittel>
                        <Lenke href={`${window.BASE_URL}/login`}>Logg inn på nytt</Lenke>
                    </div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
}

/* eslint-disable-next-line no-undef */
export default hot(module)(Root);
