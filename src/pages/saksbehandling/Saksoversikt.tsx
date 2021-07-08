import * as RemoteData from '@devexperts/remote-data-ts';
import AlertStripe from 'nav-frontend-alertstriper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Innholdstittel } from 'nav-frontend-typografi';
import React, { useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { Route, Switch, useHistory } from 'react-router-dom';

import { ApiError, ErrorCode } from '~api/apiClient';
import { FeatureToggle } from '~api/featureToggleApi';
import Hendelseslogg from '~components/hendelseslog/Hendelseslogg';
import Personlinje from '~components/personlinje/Personlinje';
import Personsøk from '~components/Personsøk/Personsøk';
import { Languages } from '~components/TextProvider';
import * as personSlice from '~features/person/person.slice';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useFeatureToggle } from '~lib/featureToggles';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { useAppSelector, useAppDispatch } from '~redux/Store';

import messages from './saksoversikt-nb';
import styles from './saksoversikt.module.less';
import ÅpneBehandlinger from './åpneBehandlinger/ÅpneBehandlinger';

const Vilkår = React.lazy(() => import('./søknadsbehandling/vilkår/Vilkår'));
const SendTilAttesteringPage = React.lazy(() => import('./sendTilAttesteringPage/SendTilAttesteringPage'));
const Vedtaksoppsummering = React.lazy(() => import('~pages/vedtak/Vedtaksoppsummering'));
const BehandlingsoppsummeringPage = React.lazy(
    () => import('./behandlingsoppsummeringPage/BehandlingsoppsummeringPage')
);
const LukkSøknad = React.lazy(() => import('./lukkSøknad/LukkSøknad'));
const Revurdering = React.lazy(() => import('./revurdering/Revurdering'));
const Sakintro = React.lazy(() => import('./sakintro/Sakintro'));

const Saksoversikt = () => {
    const urlParams = Routes.useRouteParams<typeof Routes.saksoversiktValgtSak>();
    const history = useHistory();

    const { intl } = useI18n({ messages });

    const { søker, sak } = useAppSelector((s) => ({ søker: s.søker.søker, sak: s.sak.sak }));
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (urlParams.sakId && RemoteData.isInitial(sak)) {
            dispatch(sakSlice.fetchSak({ sakId: urlParams.sakId }));
        }
    }, [sak._tag]);

    useEffect(() => {
        if (RemoteData.isSuccess(sak)) {
            if (RemoteData.isInitial(søker)) {
                dispatch(personSlice.fetchPerson({ fnr: sak.value.fnr }));
            } else if (RemoteData.isSuccess(søker) && !urlParams.sakId) {
                rerouteToSak(sak.value.id);
            }
        }
    }, [sak._tag, søker._tag]);

    const featureHendelseslogg = useFeatureToggle(FeatureToggle.Hendelseslogg);

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
                <Route path={Routes.saksoversiktÅpneBehandlinger.path}>
                    <ÅpneBehandlinger />
                </Route>
                <Route path={Routes.saksoversiktValgtSak.path}>
                    {pipe(
                        RemoteData.combine(søker, sak),
                        RemoteData.fold(
                            () => null,
                            () => <NavFrontendSpinner />,
                            () =>
                                RemoteData.isFailure(søker) ? (
                                    <AlertStripe type="feil">{visErrorMelding(søker.error)}</AlertStripe>
                                ) : (
                                    RemoteData.isFailure(sak) && (
                                        <AlertStripe type="feil">
                                            {intl.formatMessage(
                                                { id: 'feilmelding.generisk' },
                                                {
                                                    statusCode: sak.error.statusCode,
                                                }
                                            )}
                                        </AlertStripe>
                                    )
                                ),
                            ([søker, sak]) => (
                                <>
                                    <Personlinje søker={søker} sak={sak} />
                                    <div className={styles.container}>
                                        <Switch>
                                            <Route path={Routes.avsluttSøknadsbehandling.path}>
                                                <div className={styles.mainContent}>
                                                    <LukkSøknad sak={sak} />
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
                                                <div className={styles.mainContent}>
                                                    <Switch>
                                                        <Route path={Routes.saksbehandlingSendTilAttestering.path}>
                                                            <SendTilAttesteringPage sak={sak} />
                                                        </Route>
                                                        <Route path={Routes.saksbehandlingVilkårsvurdering.path}>
                                                            <Vilkår sak={sak} søker={søker} />
                                                        </Route>
                                                        <Route path={Routes.saksbehandlingOppsummering.path}>
                                                            <div className={styles.tittelContainer}>
                                                                <Innholdstittel className={styles.pageTittel}>
                                                                    {intl.formatMessage({
                                                                        id: 'page.behandlingsoppsummering.tittel',
                                                                    })}
                                                                </Innholdstittel>
                                                            </div>
                                                            <BehandlingsoppsummeringPage sak={sak} />
                                                        </Route>
                                                    </Switch>
                                                </div>
                                            </Route>

                                            <Route path="*">
                                                <Sakintro sak={sak} søker={søker} />
                                                {featureHendelseslogg && <Hendelseslogg sak={sak} />}
                                            </Route>
                                        </Switch>
                                    </div>
                                </>
                            )
                        )
                    )}
                </Route>
                <Route path={Routes.saksoversiktIndex.path}>
                    <div className={styles.saksoversiktContainer}>
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
                                <AlertStripe type="feil">{visErrorMelding(sak.error)}</AlertStripe>
                            )}
                        </div>
                        <ÅpneBehandlinger />
                    </div>
                </Route>
            </Switch>
        </IntlProvider>
    );
};

export default Saksoversikt;
