import * as RemoteData from '@devexperts/remote-data-ts';
import Lenke from 'nav-frontend-lenker';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Innholdstittel } from 'nav-frontend-typografi';
import React, { useEffect, Suspense } from 'react';
import { hot } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Switch, Route, useLocation } from 'react-router-dom';

import { ErrorCode } from '~/api/apiClient';
import Config from '~/config';
import { FeatureToggle } from '~api/featureToggleApi';
import { UserProvider } from '~context/userContext';
import enableHotjar from '~lib/tracking/hotjar';

import ErrorBoundary from './components/errorBoundary/ErrorBoundary';
import Header from './components/header/Header';
import WithDocTitle from './components/WithDocTitle';
import * as meSlice from './features/me/me.slice';
import { FeatureToggleProvider, useFeatureToggle } from './lib/featureToggles';
import { pipe } from './lib/fp';
import * as routes from './lib/routes';
import Store, { useAppDispatch, useAppSelector } from './redux/Store';
import styles from './root.module.less';
import { LoggedInUser } from './types/LoggedInUser';

import './externalStyles';

const Attestering = React.lazy(() => import('~pages/attestering/Attestering'));
const Drift = React.lazy(() => import('~pages/drift'));
const HomePage = React.lazy(() => import('~pages/HomePage'));
const Saksoversikt = React.lazy(() => import('~pages/saksbehandling/Saksoversikt'));
const Soknad = React.lazy(() => import('~pages/søknad'));

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
                <FeatureToggleProvider>
                    <Router>
                        <Route>
                            <ContentWrapper>
                                <Suspense fallback={<NavFrontendSpinner />}>
                                    <ScrollToTop />
                                    <Switch>
                                        <Route exact path={routes.home.path}>
                                            <WithDocTitle title="Hjem" Page={HomePage} />
                                        </Route>
                                        <Route path={routes.soknad.path}>
                                            <WithDocTitle title="Søknad" Page={Soknad} />
                                        </Route>
                                        <Route path={routes.saksoversiktIndex.path}>
                                            <WithDocTitle title="Saksbehandling" Page={Saksoversikt} />
                                        </Route>
                                        <Route path={routes.attestering.path}>
                                            <WithDocTitle title="Attestering" Page={Attestering} />
                                        </Route>
                                        <Route path={routes.drift.path}>
                                            <WithDocTitle title="Drift" Page={Drift} />
                                        </Route>
                                        <Route>404</Route>
                                    </Switch>
                                </Suspense>
                            </ContentWrapper>
                        </Route>
                    </Router>
                </FeatureToggleProvider>
            </ErrorBoundary>
        </Provider>
    );
};

const ContentWrapper: React.FC = (props) => {
    const loggedInUser = useAppSelector((s) => s.me.me);

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (RemoteData.isInitial(loggedInUser)) {
            dispatch(meSlice.fetchMe());
        }
    }, [loggedInUser._tag]);

    const hotjarToggle = useFeatureToggle(FeatureToggle.Hotjar);
    useEffect(() => {
        hotjarToggle && enableHotjar();
    }, [hotjarToggle]);

    return (
        <div>
            <a href="#main-content" className="sr-only sr-only-focusable">
                Hopp til innhold
            </a>
            <Header
                user={pipe(
                    loggedInUser,
                    RemoteData.getOrElse<unknown, LoggedInUser | null>(() => null)
                )}
            />
            <main className={styles.contentContainer} id="main-content" tabIndex={-1}>
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
                                    <Lenke href={`${Config.LOGIN_URL}?redirectTo=${window.location.pathname}`}>
                                        Logg inn på nytt
                                    </Lenke>
                                </div>
                            );
                        },
                        (u) => <UserProvider user={u}>{props.children}</UserProvider>
                    )
                )}
            </main>
        </div>
    );
};

/* eslint-disable-next-line no-undef */
export default hot(module)(Root);
