// eslint-disable-next-line
import { Loader } from '@navikt/ds-react';
import React, { Suspense, useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';

import { FeatureToggleProvider } from '~src/lib/featureToggles';
import Attestering from '~src/pages/saksbehandling/attestering/Attestering';
import AttesterKlage from '~src/pages/saksbehandling/attestering/attesterKlage/AttesterKlage';
import AttesterRevurdering from '~src/pages/saksbehandling/attestering/attesterRevurdering/AttesterRevurdering';
import AttesterSøknadsbehandling from '~src/pages/saksbehandling/attestering/attesterSøknadsbehandling/AttesterSøknadsbehandling';

import ErrorBoundary from './components/errorBoundary/ErrorBoundary';
import WithDocTitle from './components/WithDocTitle';
import * as routes from './lib/routes';
import Store from './redux/Store';

import './externalStyles';
import { ContentWrapper } from './utils/router/ContentWrapper';

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
                    <ContentWrapper>
                        <Suspense fallback={<Loader />}>
                            <ScrollToTop />
                            <AppRoutes />
                        </Suspense>
                    </ContentWrapper>
                </BrowserRouter>
            </FeatureToggleProvider>
        </ErrorBoundary>
    </Provider>
);

const AppRoutes = () => (
    <Routes>
        <Route path={routes.home.path} element={<WithDocTitle title="Hjem" Page={HomePage} />} />
        <Route path={routes.soknad.path + '*'} element={<WithDocTitle title="Søknad" Page={Soknad} />} />
        <Route
            path={routes.saksoversiktValgtSak.path + '*'}
            element={<WithDocTitle title="Saksbehandling" Page={Saksoversikt} />}
        />
        <Route
            path={routes.saksoversiktIndex.path}
            element={<WithDocTitle title="Behandlingsoversikt" Page={Behandlingsoversikt} />}
        />
        <Route path={routes.attestering.path + '*'} element={<WithDocTitle title="Attestering" Page={Attestering} />}>
            <Route path={routes.attesterSøknadsbehandling.path} element={<AttesterSøknadsbehandling />} />
            <Route path={routes.attesterRevurdering.path} element={<AttesterRevurdering />} />
            <Route path={routes.attesterKlage.path} element={<AttesterKlage />} />
        </Route>
        <Route path={routes.drift.path} element={<WithDocTitle title="Drift" Page={Drift} />} />
        <Route path="*" element={<>404</>} />
    </Routes>
);

/* eslint-disable-next-line no-undef */
export default Root;
