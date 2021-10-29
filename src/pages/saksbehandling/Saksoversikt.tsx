import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Loader } from '@navikt/ds-react';
import React, { useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { Route, Switch, useHistory } from 'react-router-dom';

import { ApiError, ErrorCode } from '~api/apiClient';
import Personlinje from '~components/personlinje/Personlinje';
import Personsøk from '~components/Personsøk/Personsøk';
import { SøknadsbehandlingDraftProvider } from '~context/søknadsbehandlingDraftContext';
import * as personSlice from '~features/person/person.slice';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useI18n, Languages } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import Restanser from './restans/Restanser';
import messages from './saksoversikt-nb';
import styles from './saksoversikt.module.less';
import Gjenoppta from './stans/gjenoppta/gjenoppta';

const Vilkår = React.lazy(() => import('./søknadsbehandling/vilkår/Vilkår'));
const SendTilAttesteringPage = React.lazy(
    () => import('./søknadsbehandling/sendTilAttesteringPage/SendTilAttesteringPage')
);
const AvslåttSøknad = React.lazy(() => import('~pages/saksbehandling/avslag/AvslåttSøknad'));
const Vedtaksoppsummering = React.lazy(() => import('~pages/saksbehandling/vedtak/Vedtaksoppsummering'));
const LukkSøknad = React.lazy(() => import('./lukkSøknad/LukkSøknad'));
const Revurdering = React.lazy(() => import('./revurdering/Revurdering'));
const Sakintro = React.lazy(() => import('./sakintro/Sakintro'));
const DokumenterPage = React.lazy(() => import('~pages/saksbehandling/dokumenter/DokumenterPage'));
const StansPage = React.lazy(() => import('./stans/Stans'));

const Saksoversikt = () => {
    const urlParams = Routes.useRouteParams<typeof Routes.saksoversiktValgtSak>();
    const history = useHistory();

    const { intl } = useI18n({ messages });

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

    const visErrorMelding = (error: ApiError): string => {
        switch (error.statusCode) {
            case ErrorCode.Unauthorized:
                return intl.formatMessage({ id: 'feilmelding.ikkeTilgang' });
            case ErrorCode.NotFound:
                return intl.formatMessage({
                    id: 'feilmelding.fantIkkeSak',
                });
            default:
                return intl.formatMessage(
                    { id: 'feilmelding.generisk' },
                    {
                        statusCode: error.statusCode,
                    }
                );
        }
    };

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
                                    <Alert variant="error">{visErrorMelding(søker.error)}</Alert>
                                ) : (
                                    RemoteData.isFailure(sak) && (
                                        <Alert variant="error">
                                            {intl.formatMessage(
                                                { id: 'feilmelding.generisk' },
                                                {
                                                    statusCode: sak.error.statusCode,
                                                }
                                            )}
                                        </Alert>
                                    )
                                ),
                            ([søker, sak]) => (
                                <>
                                    <Personlinje søker={søker} sak={sak} />
                                    <div className={styles.container}>
                                        <Switch>
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
                                            <Route path={Routes.avsluttSøknadsbehandling.path}>
                                                <div className={styles.mainContent}>
                                                    <LukkSøknad sak={sak} />
                                                </div>
                                            </Route>
                                            <Route path={Routes.avslagManglendeDokSøknadsbehandling.path}>
                                                <div className={styles.mainContent}>
                                                    <AvslåttSøknad sak={sak} />
                                                </div>
                                            </Route>
                                            <Route path={Routes.revurderValgtSak.path}>
                                                <div className={styles.mainContent}>
                                                    <Revurdering sak={sak} />
                                                </div>
                                            </Route>
                                            <Route path={Routes.revurderValgtRevurdering.path}>
                                                <div className={styles.mainContent}>
                                                    <Revurdering sak={sak} />
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
                    <div className={styles.saksoversiktForside}>
                        <div className={styles.search}>
                            <Personsøk
                                onReset={() => {
                                    dispatch(personSlice.default.actions.resetSøker());
                                    dispatch(sakSlice.default.actions.resetSak());
                                }}
                                onFetchByFnr={(fnr) => {
                                    dispatch(personSlice.fetchPerson({ fnr }));
                                    dispatch(sakSlice.fetchSak({ fnr }));
                                }}
                                onFetchBySaksnummer={async (saksnummer) => {
                                    const res = await dispatch(sakSlice.fetchSak({ saksnummer }));
                                    if (sakSlice.fetchSak.fulfilled.match(res)) {
                                        dispatch(personSlice.fetchPerson({ fnr: res.payload.fnr }));
                                    }
                                }}
                                person={søker}
                                autofocusPersonsøk
                            />
                            {RemoteData.isFailure(sak) && !RemoteData.isFailure(søker) && (
                                <Alert variant="error">{visErrorMelding(sak.error)}</Alert>
                            )}
                        </div>
                        <Restanser />
                    </div>
                </Route>
            </Switch>
        </IntlProvider>
    );
};

export default Saksoversikt;
