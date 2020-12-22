import * as RemoteData from '@devexperts/remote-data-ts';
import { PersonCard, Gender } from '@navikt/nap-person-card';
import AlertStripe from 'nav-frontend-alertstriper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useEffect, useMemo } from 'react';
import { IntlProvider } from 'react-intl';
import { Route, Switch, useHistory } from 'react-router-dom';

import { ApiError, ErrorCode } from '~api/apiClient';
import Hendelseslogg from '~components/Hendelseslogg';
import { PersonAdvarsel } from '~components/PersonAdvarsel';
import Personsøk from '~components/Personsøk/Personsøk';
import { Languages } from '~components/TextProvider';
import * as personSlice from '~features/person/person.slice';
import { getGender, showName } from '~features/person/personUtils';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import FeatureToggles from '~lib/featureToggles';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { useAppSelector, useAppDispatch } from '~redux/Store';

import Behandlingsoppsummering from './behandlingsoppsummering/behandlingsoppsummering';
import LukkSøknad from './lukkSøknad/LukkSøknad';
import Sakintro from './sakintro/Sakintro';
import messages from './saksoversikt-nb';
import styles from './saksoversikt.module.less';
import Vilkår from './steg/vilkår/Vilkår';
import Søkefelt from './søkefelt/Søkefelt';
import Vedtak from './vedtak/Vedtak';

const Saksoversikt = () => {
    const urlParams = Routes.useRouteParams<typeof Routes.saksoversiktValgtSak>();
    const history = useHistory();

    const intl = useI18n({ messages });

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

    const gender = useMemo<Gender>(
        () =>
            pipe(
                søker,
                RemoteData.map(getGender),
                RemoteData.getOrElse((): Gender => Gender.unknown)
            ),
        [søker._tag]
    );

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
                                    <div className={styles.headerContainer}>
                                        <PersonCard
                                            fodselsnummer={søker.fnr}
                                            gender={gender}
                                            name={showName(søker.navn)}
                                            renderLabelContent={(): JSX.Element => <PersonAdvarsel person={søker} />}
                                        />
                                        <Søkefelt />
                                    </div>
                                    <div className={styles.container}>
                                        <Switch>
                                            <Route path={Routes.avsluttSøknadsbehandling.path}>
                                                <div className={styles.mainContent}>
                                                    <LukkSøknad sak={sak} />
                                                </div>
                                            </Route>
                                            <Route path={Routes.saksoversiktValgtBehandling.path}>
                                                <div className={styles.mainContent}>
                                                    <Switch>
                                                        <Route path={Routes.saksbehandlingVedtak.path}>
                                                            <Vedtak sak={sak} />
                                                        </Route>
                                                        <Route path={Routes.saksbehandlingVilkårsvurdering.path}>
                                                            <Vilkår sak={sak} søker={søker} />
                                                        </Route>
                                                        <Route path={Routes.saksbehandlingOppsummering.path}>
                                                            <div className={styles.mainContent}>
                                                                <Behandlingsoppsummering sak={sak} />
                                                                <div>jesus christ</div>
                                                            </div>
                                                        </Route>
                                                    </Switch>
                                                </div>
                                            </Route>

                                            <Route path="*">
                                                <Sakintro sak={sak} søker={søker} />
                                                {FeatureToggles.Hendelseslogg && <Hendelseslogg sak={sak} />}
                                            </Route>
                                        </Switch>
                                    </div>
                                </>
                            )
                        )
                    )}
                </Route>
                <Route path={Routes.saksoversiktIndex.path}>
                    <div className={styles.search}>
                        <Personsøk
                            onReset={() => {
                                dispatch(personSlice.default.actions.resetSøker());
                                dispatch(sakSlice.default.actions.resetSak());
                            }}
                            onSubmit={(fnr) => {
                                dispatch(personSlice.fetchPerson({ fnr }));
                                dispatch(sakSlice.fetchSak({ fnr }));
                            }}
                            person={søker}
                        />
                        {RemoteData.isFailure(sak) && !RemoteData.isFailure(søker) && (
                            <AlertStripe type="feil">{visErrorMelding(sak.error)}</AlertStripe>
                        )}
                    </div>
                </Route>
            </Switch>
        </IntlProvider>
    );
};

export default Saksoversikt;
