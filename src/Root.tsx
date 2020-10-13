import * as RemoteData from '@devexperts/remote-data-ts';
import Header from '@navikt/nap-header';
import Lenke from 'nav-frontend-lenker';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Innholdstittel } from 'nav-frontend-typografi';
import React, { useEffect, Fragment } from 'react';
import { hot } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Switch, Route, useLocation, useHistory } from 'react-router-dom';

import { ErrorCode } from '~/api/apiClient';
import { UserProvider } from '~context/userContext';
import Attestering from '~pages/attestering/Attestering';
import HomePage from '~pages/HomePage';
import Saksoversikt from '~pages/saksbehandling/Saksoversikt';

import ErrorBoundary from './components/ErrorBoundary';
import Menyknapp from './components/Menyknapp';
import * as meSlice from './features/me/me.slice';
import * as Cookies from './lib/cookies';
import { pipe } from './lib/fp';
import * as routes from './lib/routes';
import Soknad from './pages/søknad';
import Store, { useAppDispatch, useAppSelector } from './redux/Store';
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
                    <Route path="/auth/complete">
                        <AuthComplete />
                    </Route>
                    <Route path="/logout/complete">
                        <LogoutComplete />
                    </Route>
                    <Route>
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
                                    <Route path={routes.saksoversiktIndex.path}>
                                        <Saksoversikt />
                                    </Route>
                                    <Route path={routes.attestering.path}>
                                        <Attestering />
                                    </Route>
                                    <Route>404</Route>
                                </Switch>
                            </Fragment>
                        </ContentWrapper>
                    </Route>
                </Router>
            </ErrorBoundary>
        </Provider>
    );
};

const AuthComplete = () => {
    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        const tokens = location.hash.split('#');

        const accessToken = tokens[1];
        const refreshToken = tokens[2];
        if (!accessToken || !refreshToken) {
            console.error('On /auth/complete but no accesstoken/refreshtoken found');
            return;
        }
        Cookies.set(Cookies.CookieName.AccessToken, accessToken);
        Cookies.set(Cookies.CookieName.RefreshToken, refreshToken);
        const redirectUrl = Cookies.take(Cookies.CookieName.LoginRedirectUrl);
        history.push(redirectUrl ?? '/');
    }, []);

    return null;
};

const LogoutComplete = () => {
    const history = useHistory();

    useEffect(() => {
        Cookies.remove(Cookies.CookieName.AccessToken);
        Cookies.remove(Cookies.CookieName.RefreshToken);
        history.push('/');
    }, []);

    return null;
};

const ContentWrapper: React.FC = (props) => {
    const loggedInUser = useAppSelector((s) => s.me.me);

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (RemoteData.isInitial(loggedInUser)) {
            dispatch(meSlice.fetchMe());
        }
    }, [loggedInUser._tag]);

    return (
        <div>
            <Header title="Supplerende stønad Ufør" titleHref={'/'}>
                {RemoteData.isSuccess(loggedInUser) && (
                    <Menyknapp
                        navn={loggedInUser.value.navn}
                        onLoggUtClick={() => {
                            window.location.href = `${window.BASE_URL}/logout`;
                        }}
                    />
                )}
            </Header>
            <div className={styles.contentContainer}>
                {pipe(
                    loggedInUser,
                    RemoteData.fold(
                        () => <NavFrontendSpinner />,
                        () => <NavFrontendSpinner />,
                        (err) => {
                            return (
                                <div className={styles.ikkeTilgangContainer}>
                                    <Innholdstittel className={styles.overskrift}>
                                        {err.statusCode === ErrorCode.NotAuthenticated ||
                                        err.statusCode === ErrorCode.Unauthorized
                                            ? 'Ikke tilgang'
                                            : 'En feil oppstod'}
                                    </Innholdstittel>
                                    <Lenke
                                        href={`${window.BASE_URL}/login`}
                                        onClick={() => {
                                            Cookies.set(Cookies.CookieName.LoginRedirectUrl, window.location.pathname);
                                        }}
                                    >
                                        Logg inn på nytt
                                    </Lenke>
                                </div>
                            );
                        },
                        (u) => <UserProvider user={u}>{props.children}</UserProvider>
                    )
                )}
            </div>
        </div>
    );
};

/* eslint-disable-next-line no-undef */
export default hot(module)(Root);
