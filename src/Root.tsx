// eslint-disable-next-line
import * as RemoteData from '@devexperts/remote-data-ts';
import { Heading, Link, Loader } from '@navikt/ds-react';
import React, { useEffect, Suspense } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch, useLocation } from 'react-router-dom';
import { CompatRouter, CompatRoute } from 'react-router-dom-v5-compat';

import { ErrorCode } from '~src/api/apiClient';
import { LOGIN_URL } from '~src/api/authUrl';
import { FeatureToggle } from '~src/api/featureToggleApi';
import { UserProvider } from '~src/context/userContext';
import { FeatureToggleProvider, useFeatureToggle } from '~src/lib/featureToggles';
import { pipe } from '~src/lib/fp';
import enableHotjar from '~src/lib/tracking/hotjar';
import { LoggedInUser } from '~src/types/LoggedInUser';

import ErrorBoundary from './components/errorBoundary/ErrorBoundary';
import Header from './components/header/Header';
import WithDocTitle from './components/WithDocTitle';
import * as meSlice from './features/me/me.slice';
import * as routes from './lib/routes';
import Store, { useAppDispatch, useAppSelector } from './redux/Store';
import * as styles from './root.module.less';
import './externalStyles';

const Attestering = React.lazy(() => import('~/src/pages/saksbehandling/attestering/Attestering'));
const Drift = React.lazy(() => import('~/src/pages/drift'));
const HomePage = React.lazy(() => import('~/src/pages/HomePage'));
const Saksoversikt = React.lazy(() => import('~/src/pages/saksbehandling/Saksoversikt'));
const Behandlingsoversikt = React.lazy(
    () => import('~/src/pages/saksbehandling/behandlingsoversikt/Behandlingsoversikt')
);
const Soknad = React.lazy(() => import('~/src/pages/søknad'));

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

const Root = () => (
    <Provider store={Store}>
        <ErrorBoundary>
            <FeatureToggleProvider>
                <BrowserRouter>
                    <CompatRouter>
                        <ContentWrapper>
                            <Suspense fallback={<Loader />}>
                                <ScrollToTop />
                                <Switch>
                                    <CompatRoute exact path={routes.home.path}>
                                        <WithDocTitle title="Hjem" Page={HomePage} />
                                    </CompatRoute>
                                    <Route path={routes.soknad.path}>
                                        <WithDocTitle title="Søknad" Page={Soknad} />
                                    </Route>
                                    <Route path={routes.saksoversiktValgtSak.path}>
                                        <WithDocTitle title="Saksbehandling" Page={Saksoversikt} />
                                    </Route>
                                    <Route path={routes.saksoversiktIndex.path}>
                                        <WithDocTitle title="Behandlingsoversikt" Page={Behandlingsoversikt} />
                                    </Route>
                                    <Route path={routes.attestering.path}>
                                        <WithDocTitle title="Attestering" Page={Attestering} />
                                    </Route>
                                    <CompatRoute path={routes.drift.path}>
                                        <WithDocTitle title="Drift" Page={Drift} />
                                    </CompatRoute>
                                    <CompatRouter>404</CompatRouter>
                                </Switch>
                            </Suspense>
                        </ContentWrapper>
                    </CompatRouter>
                </BrowserRouter>
            </FeatureToggleProvider>
        </ErrorBoundary>
    </Provider>
);

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
                        () => <Loader />,
                        () => <Loader />,
                        (err) => {
                            return (
                                <div className={styles.ikkeTilgangContainer}>
                                    <Heading level="1" size="medium" className={styles.overskrift}>
                                        {err.statusCode === ErrorCode.NotAuthenticated ||
                                        err.statusCode === ErrorCode.Unauthorized
                                            ? 'Ikke tilgang'
                                            : 'En feil oppstod'}
                                    </Heading>
                                    <Link href={`${LOGIN_URL}?redirectTo=${window.location.pathname}`}>
                                        Logg inn på nytt
                                    </Link>
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
export default Root;
