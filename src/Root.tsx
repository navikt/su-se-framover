import Header from '@navikt/nap-header';
import Lenke from 'nav-frontend-lenker';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Innholdstittel } from 'nav-frontend-typografi';
import React, { useEffect, useState, Fragment } from 'react';
import { hot } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Switch, Route, useLocation, useHistory, useRouteMatch } from 'react-router-dom';

import apiClient from '~/api/apiClient';
import HomePage from '~pages/HomePage';
import Saksoversikt from '~pages/saksoversikt/Saksoversikt';

import ErrorBoundary from './components/ErrorBoundary';
import Menyknapp from './components/Menyknapp';
import * as Cookies from './lib/cookies';
import * as routes from './lib/routes';
import Soknad from './pages/søknad';
import Store from './redux/Store';
import styles from './root.module.less';
import './externalStyles';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

const Root = () => {
    return (
        <Provider store={Store}>
            <ErrorBoundary>
                <Router>
                    <ContentWrapper>
                        <Fragment>
                            <ScrollToTop />
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
                        </Fragment>
                    </ContentWrapper>
                </Router>
            </ErrorBoundary>
        </Provider>
    );
};

type LoginState = 'logging-in' | 'logged-in' | 'unauthorized' | 'error';

function ContentWrapper({ children }: { children: React.ReactChild }) {
    const authCompleteRouteMatch = useRouteMatch('/auth/complete');
    const [loginState, setLoginState] = useState<LoginState>('logging-in');
    const navn = Cookies.getNameFromAccessToken();

    useEffect(() => {
        if (authCompleteRouteMatch) {
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
    }, [authCompleteRouteMatch]);

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
