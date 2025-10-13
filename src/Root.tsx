import { Loader } from '@navikt/ds-react';
import { lazy, Suspense, useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom';

import ErrorBoundary from './components/errorBoundary/ErrorBoundary';
import Toaster from './components/toast/Toaster';
import WithDocTitle from './components/WithDocTitle';
import * as routes from './lib/routes';
import BrevPage from './pages/saksbehandling/brev/BrevPage';
import Vilkår from './pages/saksbehandling/søknadsbehandling/vilkår/Vilkår';
import Store from './redux/Store';
import './externalStyles';
import { ContentWrapper } from './utils/router/ContentWrapper';

const Attestering = lazy(() => import('./pages/saksbehandling/attestering/Attestering'));
const Kvittering = lazy(() => import('./pages/søknad/kvittering/Kvittering'));
const Infoside = lazy(() => import('./pages/søknad/steg/infoside/Infoside'));
const Inngang = lazy(() => import('./pages/søknad/steg/inngang/Inngang'));
const Søknadsvelger = lazy(() => import('./pages/søknad/Søknadsvelger'));
const StartUtfylling = lazy(() => import('./pages/søknad/steg/start-utfylling/StartUtfylling'));
const Drift = lazy(() => import('./pages/drift'));
const DevTools = lazy(() => import('./pages/dev/DevToolsPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const Saksoversikt = lazy(() => import('./pages/saksbehandling/Saksoversikt'));
const Behandlingsoversikt = lazy(() => import('./pages/saksbehandling/behandlingsoversikt/Behandlingsoversikt'));
const Soknad = lazy(() => import('./pages/søknad'));
const SendTilAttesteringPage = lazy(
    () => import('./pages/saksbehandling/søknadsbehandling/sendTilAttesteringPage/SendTilAttesteringPage'),
);
const VedtakEllerOversendtKlageOppsummering = lazy(
    () => import('./pages/saksbehandling/vedtak/./VedtakEllerKlageOppsummering'),
);
const AvsluttBehandling = lazy(() => import('./pages/saksbehandling/avsluttBehandling/AvsluttBehandling'));
const Revurdering = lazy(() => import('./pages/saksbehandling/revurdering/Revurdering'));
const Sakintro = lazy(() => import('./pages/saksbehandling/sakintro/Sakintro'));
const DokumenterPage = lazy(() => import('./pages/saksbehandling/dokumenter/DokumenterPage'));
const OpprettKlage = lazy(() => import('./pages/klage/opprettKlage/OpprettKlage'));
const Klage = lazy(() => import('./pages/klage/Klage'));
const NyDatoForKontrollsamtale = lazy(() => import('./pages/kontrollsamtale/KontrollsamtalePage'));
const RevurderingIntroPage = lazy(
    () => import('./pages/saksbehandling/revurdering/revurderingIntro/RevurderingIntroPage'),
);
const ManuellReguleringPage = lazy(() => import('./pages/saksbehandling/regulering/ManuellRegulering'));
const Stans = lazy(() => import('./pages/saksbehandling/stans/Stans'));
const Gjenoppta = lazy(() => import('./pages/saksbehandling/gjenoppta/Gjenoppta'));
const Utenlandsopphold = lazy(() => import('./pages/saksbehandling/utenlandsopphold/Utenlandsopphold'));
const Tilbakekreving = lazy(() => import('./pages/saksbehandling/tilbakekreving/Tilbakekreving'));

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

const Root = () => (
    <Provider store={Store}>
        <BrowserRouter>
            <ErrorBoundary>
                <ContentWrapper>
                    <Suspense fallback={<Loader />}>
                        <Toaster />
                        <ScrollToTop />
                        <AppRoutes />
                    </Suspense>
                </ContentWrapper>
            </ErrorBoundary>
        </BrowserRouter>
    </Provider>
);

const AppRoutes = () => (
    <Routes>
        <Route path={routes.home.path} element={<WithDocTitle title="Hjem" Page={HomePage} />} />
        <Route path={routes.devTools.path} element={<DevTools />} />
        <Route path={routes.soknad.path} element={<WithDocTitle title="Søknad" Page={Outlet} />}>
            <Route index element={<Søknadsvelger />} />
            <Route path={routes.soknadtema.path} element={<Soknad />}>
                <Route index element={<Infoside />} />
                <Route path={routes.soknadPersonSøk.path} element={<Inngang />} />
                <Route path={routes.soknadsutfylling.path} element={<StartUtfylling />} />
                <Route path={routes.søknadskvittering.path} element={<Kvittering />} />
            </Route>
        </Route>
        <Route
            path={routes.saksoversiktValgtSak.path}
            element={<WithDocTitle title="Saksbehandling" Page={Saksoversikt} />}
        >
            <Route index element={<Sakintro />} />
            <Route path={routes.klageRoot.path}>
                <Route path={routes.klageOpprett.path} element={<OpprettKlage />} />
                <Route path={routes.klage.path} element={<Klage />} />
            </Route>
            <Route path={routes.stansRoot.path} element={<Stans />} />
            <Route path={routes.gjenopptaStansRoot.path} element={<Gjenoppta />} />

            <Route path={routes.attestering.path} element={<Attestering />} />
            <Route path={routes.avsluttBehandling.path} element={<AvsluttBehandling />} />
            <Route path={routes.revurderValgtSak.path} element={<RevurderingIntroPage />} />
            <Route path={routes.revurderingSeksjonSteg.path} element={<Revurdering />} />
            <Route
                path={routes.vedtakEllerKlageOppsummering.path}
                element={<VedtakEllerOversendtKlageOppsummering />}
            />
            <Route path={routes.saksbehandlingSendTilAttestering.path} element={<SendTilAttesteringPage />} />
            <Route path={routes.saksbehandlingVilkårsvurdering.path} element={<Vilkår />} />
            <Route path={routes.alleDokumenterForSak.path} element={<DokumenterPage />} />
            <Route path={routes.kontrollsamtale.path} element={<NyDatoForKontrollsamtale />} />
            <Route path={routes.manuellRegulering.path} element={<ManuellReguleringPage />} />
            <Route path={routes.utenlandsopphold.path} element={<Utenlandsopphold />} />
            <Route path={routes.brevPage.path} element={<BrevPage />} />

            <Route path={routes.tilbakekrevingRoot.path} element={<Tilbakekreving />} />
        </Route>
        <Route
            path={routes.saksoversiktIndex.path}
            element={<WithDocTitle title="Behandlingsoversikt" Page={Behandlingsoversikt} />}
        />
        <Route path={routes.drift.path} element={<WithDocTitle title="Drift" Page={Drift} />} />
        <Route path="*" element={<>404</>} />
    </Routes>
);

export default Root;
