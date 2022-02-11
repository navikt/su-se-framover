import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Loader } from '@navikt/ds-react';
import { isEmpty } from 'fp-ts/lib/Array';
import React, { useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { Route, Switch, useHistory } from 'react-router-dom';

import { visErrorMelding } from '~components/apiErrorAlert/utils';
import Personlinje from '~components/personlinje/Personlinje';
import { SøknadsbehandlingDraftProvider } from '~context/søknadsbehandlingDraftContext';
import * as personSlice from '~features/person/person.slice';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { Languages, useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Behandlingsoversikt } from '~pages/saksbehandling/behandlingsoversikt/Behandlingsoversikt';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { erInformasjonsRevurdering } from '~utils/revurdering/revurderingUtils';

import messages from './saksoversikt-nb';
import styles from './saksoversikt.module.less';
import Gjenoppta from './stans/gjenoppta/gjenoppta';

const Vilkår = React.lazy(() => import('./søknadsbehandling/vilkår/Vilkår'));
const SendTilAttesteringPage = React.lazy(
    () => import('./søknadsbehandling/sendTilAttesteringPage/SendTilAttesteringPage')
);
const Vedtaksoppsummering = React.lazy(() => import('~pages/saksbehandling/vedtak/Vedtaksoppsummering'));
const AvsluttBehandling = React.lazy(() => import('./avsluttBehandling/AvsluttBehandling'));
const Revurdering = React.lazy(() => import('./revurdering/Revurdering'));
const Sakintro = React.lazy(() => import('./sakintro/Sakintro'));
const DokumenterPage = React.lazy(() => import('~pages/saksbehandling/dokumenter/DokumenterPage'));
const StansPage = React.lazy(() => import('./stans/Stans'));
const OpprettKlage = React.lazy(() => import('~pages/klage/opprettKlage/OpprettKlage'));
const Klage = React.lazy(() => import('~pages/klage/Klage'));
const NyDatoForKontrollsamtale = React.lazy(() => import('~pages/kontrollsamtale/KontrollsamtalePage'));

const Saksoversikt = () => {
    const urlParams = Routes.useRouteParams<typeof Routes.saksoversiktValgtSak>();
    const history = useHistory();

    const { formatMessage } = useI18n({ messages });

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

    const rerouteToSak = (id: string) => history.push(Routes.saksoversiktValgtSak.createURL({ sakId: id }));

    return (
        <IntlProvider locale={Languages.nb} messages={messages}>
            <Switch>
                <Route path={Routes.saksoversiktValgtSak.path}>
                    {pipe(
                        RemoteData.combine(søker, sak),
                        RemoteData.fold(
                            () => null,
                            () => <Loader />,
                            () =>
                                RemoteData.isFailure(søker) ? (
                                    <Alert variant="error">{visErrorMelding(søker.error, formatMessage)}</Alert>
                                ) : (
                                    RemoteData.isFailure(sak) && (
                                        <Alert variant="error">
                                            {formatMessage('feilmelding.generisk', {
                                                statusCode: sak.error.statusCode,
                                            })}
                                        </Alert>
                                    )
                                ),
                            ([søker, sak]) => (
                                <>
                                    <Personlinje
                                        søker={søker}
                                        sakInfo={{ sakId: sak.id, saksnummer: sak.saksnummer }}
                                    />
                                    <div className={styles.container}>
                                        <Switch>
                                            <Route path={Routes.klageOpprett.createURL({ sakId: sak.id })}>
                                                <div className={styles.mainContent}>
                                                    <OpprettKlage sak={sak} />
                                                </div>
                                            </Route>
                                            <Route path={Routes.klage.path}>
                                                <div className={styles.mainContent}>
                                                    <Klage sak={sak} />
                                                </div>
                                            </Route>
                                            <Route path={Routes.stansRoute.path}>
                                                <div className={styles.mainContent}>
                                                    <StansPage sak={sak} />
                                                </div>
                                            </Route>
                                            <Route path={Routes.gjenopptaStansRoute.path}>
                                                <div className={styles.mainContent}>
                                                    <Gjenoppta sak={sak} />
                                                </div>
                                            </Route>
                                            <Route path={Routes.avsluttBehandling.path}>
                                                <div className={styles.mainContent}>
                                                    <AvsluttBehandling sak={sak} />
                                                </div>
                                            </Route>
                                            <Route path={Routes.revurderValgtSak.path}>
                                                <div className={styles.mainContent}>
                                                    <Revurdering
                                                        sakId={sak.id}
                                                        utbetalinger={sak.utbetalinger}
                                                        informasjonsRevurderinger={sak.revurderinger.filter(
                                                            erInformasjonsRevurdering
                                                        )}
                                                    />
                                                </div>
                                            </Route>
                                            <Route path={Routes.revurderValgtRevurdering.path}>
                                                <div className={styles.mainContent}>
                                                    <Revurdering
                                                        sakId={sak.id}
                                                        utbetalinger={sak.utbetalinger}
                                                        informasjonsRevurderinger={sak.revurderinger.filter(
                                                            erInformasjonsRevurdering
                                                        )}
                                                    />
                                                </div>
                                            </Route>
                                            <Route path={Routes.vedtaksoppsummering.path}>
                                                <div className={styles.mainContent}>
                                                    <Vedtaksoppsummering sak={sak} />
                                                </div>
                                            </Route>
                                            <Route path={Routes.saksoversiktValgtBehandling.path}>
                                                <SøknadsbehandlingDraftProvider>
                                                    <div className={styles.mainContent}>
                                                        <Switch>
                                                            <Route path={Routes.saksbehandlingSendTilAttestering.path}>
                                                                <SendTilAttesteringPage sak={sak} />
                                                            </Route>
                                                            <Route path={Routes.saksbehandlingVilkårsvurdering.path}>
                                                                <Vilkår sak={sak} søker={søker} />
                                                            </Route>
                                                        </Switch>
                                                    </div>
                                                </SøknadsbehandlingDraftProvider>
                                            </Route>
                                            <Route path={Routes.alleDokumenterForSak.path}>
                                                <div className={styles.mainContent}>
                                                    <DokumenterPage sak={sak} />
                                                </div>
                                            </Route>
                                            <Route path={Routes.kontrollsamtale.path}>
                                                <div className={styles.mainContent}>
                                                    <NyDatoForKontrollsamtale
                                                        sakId={sak.id}
                                                        kanKalleInn={!isEmpty(sak.utbetalinger)}
                                                    />
                                                </div>
                                            </Route>

                                            <Route path="*">
                                                <Sakintro sak={sak} />
                                            </Route>
                                        </Switch>
                                    </div>
                                </>
                            )
                        )
                    )}
                </Route>
                <Route path={Routes.saksoversiktIndex.path}>
                    <Behandlingsoversikt sak={sak} søker={søker} />
                </Route>
            </Switch>
        </IntlProvider>
    );
};

export default Saksoversikt;
