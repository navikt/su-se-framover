import { Loader } from '@navikt/ds-react';
import { lazy, Suspense, useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom';

import Vilkår from '~src/pages/saksbehandling/søknadsbehandling/vilkår/Vilkår';

import ErrorBoundary from './components/errorBoundary/ErrorBoundary';
import WithDocTitle from './components/WithDocTitle';
import * as routes from './lib/routes';
import BrevPage from './pages/saksbehandling/brev/BrevPage';
import Store from './redux/Store';
import './externalStyles';
import { ContentWrapper } from './utils/router/ContentWrapper';

const Attestering = lazy(() => import('~src/pages/saksbehandling/attestering/Attestering'));
const Kvittering = lazy(() => import('~src/pages/søknad/kvittering/Kvittering'));
const Infoside = lazy(() => import('~src/pages/søknad/steg/infoside/Infoside'));
const Inngang = lazy(() => import('~src/pages/søknad/steg/inngang/Inngang'));
const Søknadsvelger = lazy(() => import('~src/pages/søknad/Søknadsvelger'));
const StartUtfylling = lazy(() => import('~src/pages/søknad/steg/start-utfylling/StartUtfylling'));
const Drift = lazy(() => import('~/src/pages/drift'));
const DevTools = lazy(() => import('~/src/pages/dev/DevToolsPage'));
const HomePage = lazy(() => import('~/src/pages/HomePage'));
const Saksoversikt = lazy(() => import('~/src/pages/saksbehandling/Saksoversikt'));
const Behandlingsoversikt = lazy(() => import('~/src/pages/saksbehandling/behandlingsoversikt/Behandlingsoversikt'));
const Soknad = lazy(() => import('~/src/pages/søknad'));
const SendTilAttesteringPage = lazy(
    () => import('~/src/pages/saksbehandling/søknadsbehandling/sendTilAttesteringPage/SendTilAttesteringPage'),
);
const VedtakEllerOversendtKlageOppsummering = lazy(
    () => import('~src/pages/saksbehandling/vedtak/VedtakEllerOversendtKlageOppsummering'),
);
const AvsluttBehandling = lazy(() => import('~/src/pages/saksbehandling/avsluttBehandling/AvsluttBehandling'));
const Revurdering = lazy(() => import('~/src/pages/saksbehandling/revurdering/Revurdering'));
const Sakintro = lazy(() => import('~/src/pages/saksbehandling/sakintro/Sakintro'));
const DokumenterPage = lazy(() => import('~src/pages/saksbehandling/dokumenter/DokumenterPage'));
const OpprettKlage = lazy(() => import('~src/pages/klage/opprettKlage/OpprettKlage'));
const Klage = lazy(() => import('~src/pages/klage/Klage'));
const NyDatoForKontrollsamtale = lazy(() => import('~src/pages/kontrollsamtale/KontrollsamtalePage'));
const RevurderingIntroPage = lazy(
    () => import('~src/pages/saksbehandling/revurdering/revurderingIntro/RevurderingIntroPage'),
);
const ManuellReguleringPage = lazy(() => import('~src/pages/saksbehandling/regulering/ManuellRegulering'));
const Stans = lazy(() => import('~src/pages/saksbehandling/stans/Stans'));
const Gjenoppta = lazy(() => import('~src/pages/saksbehandling/gjenoppta/Gjenoppta'));
const Utenlandsopphold = lazy(() => import('~src/pages/saksbehandling/utenlandsopphold/Utenlandsopphold'));
const Tilbakekreving = lazy(() => import('~src/pages/saksbehandling/tilbakekreving/Tilbakekreving'));

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
            <BrowserRouter>
                <ContentWrapper>
                    <Suspense fallback={<Loader />}>
                        <ScrollToTop />
                        <AppRoutes />
                    </Suspense>
                </ContentWrapper>
            </BrowserRouter>
        </ErrorBoundary>
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
            <Route path={routes.vedtaksoppsummering.path} element={<VedtakEllerOversendtKlageOppsummering />} />
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
