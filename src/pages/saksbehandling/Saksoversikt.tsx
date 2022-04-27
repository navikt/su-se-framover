import * as RemoteData from '@devexperts/remote-data-ts';
import { Loader } from '@navikt/ds-react';
import { isEmpty } from 'fp-ts/lib/Array';
import React, { useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { useNavigate, Routes, Route } from 'react-router-dom';

import { Person } from '~src/api/personApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Personlinje from '~src/components/personlinje/Personlinje';
import * as personSlice from '~src/features/person/person.slice';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { pipe } from '~src/lib/fp';
import { Languages } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';
import { Sak } from '~src/types/Sak';
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
                navigate(routes.saksoversiktValgtSak.createURL({ sakId: sak.value.id }));
            }
        }
    }, [sak._tag, søker._tag]);

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
                                <div className={styles.mainContent}>
                                    <SakRoutes sak={sak} søker={søker} />
                                </div>
                            </div>
                        </>
                    )
                )
            )}
        </IntlProvider>
    );
};

const SakRoutes = ({ sak, søker }: { sak: Sak; søker: Person }) => (
    <Routes>
        <Route path={'/'} element={<Sakintro sak={sak} />} />
        <Route path={routes.klageOpprett.path} element={<OpprettKlage sak={sak} />} />
        <Route path={routes.klage.path} element={<Klage sak={sak} />} />
        <Route path={routes.stansOppsummeringRoute.path} element={<StansOppsummering sak={sak} />} />
        <Route path={routes.stansRoot.path} element={<StansPage sak={sak} />} />
        <Route path={routes.gjenopptaStansOppsummeringRoute.path} element={<GjenopptaOppsummering sak={sak} />} />
        <Route path={routes.gjenopptaStansRoot.path} element={<Gjenoppta sak={sak} />} />
        <Route path={routes.avsluttBehandling.path} element={<AvsluttBehandling sak={sak} />} />
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
                <Revurdering
                    sakId={sak.id}
                    utbetalinger={sak.utbetalinger}
                    informasjonsRevurderinger={sak.revurderinger.filter(erInformasjonsRevurdering)}
                />
            }
        />
        <Route path={routes.vedtaksoppsummering.path} element={<Vedtaksoppsummering sak={sak} />} />
        <Route path={routes.saksbehandlingSendTilAttestering.path} element={<SendTilAttesteringPage sak={sak} />} />
        <Route path={routes.saksbehandlingVilkårsvurdering.path} element={<Vilkår sak={sak} søker={søker} />} />
        <Route path={routes.alleDokumenterForSak.path} element={<DokumenterPage sak={sak} />} />
        <Route
            path={routes.kontrollsamtale.path}
            element={<NyDatoForKontrollsamtale sakId={sak.id} kanKalleInn={!isEmpty(sak.utbetalinger)} />}
        />
    </Routes>
);

export default Saksoversikt;
