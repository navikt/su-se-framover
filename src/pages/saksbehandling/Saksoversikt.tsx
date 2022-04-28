import * as RemoteData from '@devexperts/remote-data-ts';
import { Loader } from '@navikt/ds-react';
import { isEmpty } from 'fp-ts/lib/Array';
import React, { useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { useNavigate, Routes, Route } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Personlinje from '~src/components/personlinje/Personlinje';
import { SøknadsbehandlingDraftProvider } from '~src/context/søknadsbehandlingDraftContext';
import * as personSlice from '~src/features/person/person.slice';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { pipe } from '~src/lib/fp';
import { Languages } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';
import { erInformasjonsRevurdering } from '~src/utils/revurdering/revurderingUtils';

import messages from './saksoversikt-nb';
import * as styles from './saksoversikt.module.less';

const Gjenoppta = React.lazy(() => import('./stans/gjenoppta/gjenoppta'));
const StansOppsummering = React.lazy(() => import('~src/pages/saksbehandling/stans/stansOppsummering'));
const Vilkår = React.lazy(() => import('./søknadsbehandling/vilkår/Vilkår'));
const SendTilAttesteringPage = React.lazy(
    () => import('./søknadsbehandling/sendTilAttesteringPage/SendTilAttesteringPage')
);
const Vedtaksoppsummering = React.lazy(() => import('~src/pages/saksbehandling/vedtak/Vedtaksoppsummering'));
const AvsluttBehandling = React.lazy(() => import('./avsluttBehandling/AvsluttBehandling'));
const Revurdering = React.lazy(() => import('./revurdering/Revurdering'));
const Sakintro = React.lazy(() => import('./sakintro/Sakintro'));
const DokumenterPage = React.lazy(() => import('~src/pages/saksbehandling/dokumenter/DokumenterPage'));
const StansPage = React.lazy(() => import('./stans/Stans'));
const OpprettKlage = React.lazy(() => import('~src/pages/klage/opprettKlage/OpprettKlage'));
const Klage = React.lazy(() => import('~src/pages/klage/Klage'));
const NyDatoForKontrollsamtale = React.lazy(() => import('~src/pages/kontrollsamtale/KontrollsamtalePage'));
const RevurderingIntroPage = React.lazy(
    () => import('~src/pages/saksbehandling/revurdering/revurderingIntro/RevurderingIntroPage')
);
const GjenopptaOppsummering = React.lazy(
    () => import('~src/pages/saksbehandling/stans/gjenoppta/gjenopptaOppsummering')
);
const ManuellReguleringPage = React.lazy(() => import('~src/pages/saksbehandling/regulering/ManuellRegulering'));

const Saksoversikt = () => {
    const urlParams = routes.useRouteParams<typeof routes.saksoversiktValgtSak>();
    const navigate = useNavigate();

    const { søker, sak } = useAppSelector((s) => ({ søker: s.søker.søker, sak: s.sak.sak }));
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (urlParams.sakId) {
            dispatch(sakSlice.fetchSak({ sakId: urlParams.sakId }));
        }
    }, []);

    useEffect(() => {
        if (RemoteData.isSuccess(sak)) {
            if (RemoteData.isInitial(søker)) {
                dispatch(personSlice.fetchPerson({ fnr: sak.value.fnr }));
            } else if (RemoteData.isSuccess(søker) && !urlParams.sakId) {
                rerouteToSak(sak.value.id);
            }
        }
    }, [sak._tag, søker._tag]);

    const rerouteToSak = (id: string) => navigate(routes.saksoversiktValgtSak.createURL({ sakId: id }));

    return (
        <IntlProvider locale={Languages.nb} messages={messages}>
            {pipe(
                RemoteData.combine(søker, sak),
                RemoteData.fold(
                    () => null,
                    () => <Loader />,
                    () =>
                        RemoteData.isFailure(søker) ? (
                            <ApiErrorAlert error={søker.error} />
                        ) : (
                            RemoteData.isFailure(sak) && <ApiErrorAlert error={sak.error} />
                        ),
                    ([søker, sak]) => (
                        <>
                            <Personlinje søker={søker} sakInfo={{ sakId: sak.id, saksnummer: sak.saksnummer }} />
                            <div className={styles.container}>
                                <Routes>
                                    <Route
                                        path={routes.klageOpprett.path}
                                        element={
                                            <div className={styles.mainContent}>
                                                <OpprettKlage sak={sak} />
                                            </div>
                                        }
                                    />

                                    <Route
                                        path={routes.klage.path}
                                        element={
                                            <div className={styles.mainContent}>
                                                <Klage sak={sak} />
                                            </div>
                                        }
                                    />

                                    <Route
                                        path={routes.stansOppsummeringRoute.path}
                                        element={
                                            <div className={styles.mainContent}>
                                                <StansOppsummering sak={sak} />
                                            </div>
                                        }
                                    />

                                    <Route
                                        path={routes.stansRoot.path}
                                        element={
                                            <div className={styles.mainContent}>
                                                <StansPage sak={sak} />
                                            </div>
                                        }
                                    />

                                    <Route
                                        path={routes.gjenopptaStansOppsummeringRoute.path}
                                        element={
                                            <div className={styles.mainContent}>
                                                <GjenopptaOppsummering sak={sak} />
                                            </div>
                                        }
                                    />

                                    <Route
                                        path={routes.gjenopptaStansRoot.path}
                                        element={
                                            <div className={styles.mainContent}>
                                                <Gjenoppta sak={sak} />
                                            </div>
                                        }
                                    />

                                    <Route
                                        path={routes.manuellRegulering.path}
                                        element={
                                            <div className={styles.mainContent}>
                                                <ManuellReguleringPage sak={sak} />
                                            </div>
                                        }
                                    />

                                    <Route
                                        path={routes.avsluttBehandling.path}
                                        element={
                                            <div className={styles.mainContent}>
                                                <AvsluttBehandling sak={sak} />
                                            </div>
                                        }
                                    />

                                    <Route
                                        path={routes.revurderValgtSak.path}
                                        element={
                                            <RevurderingIntroPage
                                                sakId={sak.id}
                                                utbetalinger={sak.utbetalinger}
                                                informasjonsRevurdering={undefined}
                                            />
                                        }
                                    />
                                    <Route
                                        path={routes.revurderValgtRevurdering.path + '*'}
                                        element={
                                            <div className={styles.mainContent}>
                                                <Revurdering
                                                    sakId={sak.id}
                                                    utbetalinger={sak.utbetalinger}
                                                    informasjonsRevurderinger={sak.revurderinger.filter(
                                                        erInformasjonsRevurdering
                                                    )}
                                                />
                                            </div>
                                        }
                                    />
                                    <Route
                                        path={routes.vedtaksoppsummering.path}
                                        element={
                                            <div className={styles.mainContent}>
                                                <Vedtaksoppsummering sak={sak} />
                                            </div>
                                        }
                                    />

                                    <Route
                                        path={routes.saksbehandlingSendTilAttestering.path}
                                        element={
                                            <div className={styles.mainContent}>
                                                <SendTilAttesteringPage sak={sak} />
                                            </div>
                                        }
                                    />
                                    <Route
                                        path={routes.saksbehandlingVilkårsvurdering.path}
                                        element={
                                            <SøknadsbehandlingDraftProvider>
                                                <div className={styles.mainContent}>
                                                    <Vilkår sak={sak} søker={søker} />
                                                </div>
                                            </SøknadsbehandlingDraftProvider>
                                        }
                                    />

                                    <Route
                                        path={routes.alleDokumenterForSak.path}
                                        element={
                                            <div className={styles.mainContent}>
                                                <DokumenterPage sak={sak} />
                                            </div>
                                        }
                                    />

                                    <Route
                                        path={routes.kontrollsamtale.path}
                                        element={
                                            <div className={styles.mainContent}>
                                                <NyDatoForKontrollsamtale
                                                    sakId={sak.id}
                                                    kanKalleInn={!isEmpty(sak.utbetalinger)}
                                                />
                                            </div>
                                        }
                                    />

                                    <Route path={'/'} element={<Sakintro sak={sak} />} />
                                </Routes>
                            </div>
                        </>
                    )
                )
            )}
        </IntlProvider>
    );
};

export default Saksoversikt;
