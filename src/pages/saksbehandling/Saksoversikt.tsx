import * as RemoteData from '@devexperts/remote-data-ts';
import { PersonCard, Gender } from '@navikt/nap-person-card';
import AlertStripe from 'nav-frontend-alertstriper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useEffect, useMemo } from 'react';
import { IntlProvider } from 'react-intl';
import { Route, Switch, useHistory } from 'react-router-dom';

import { ErrorCode } from '~api/apiClient';
import { Kjønn } from '~api/personApi';
import Hendelseslogg from '~components/Hendelseslogg';
import { PersonAdvarsel } from '~components/PersonAdvarsel';
import { Languages } from '~components/TextProvider';
import * as personSlice from '~features/person/person.slice';
import { showName } from '~features/person/personUtils';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { useAppSelector, useAppDispatch } from '~redux/Store';

import Beregning from './beregning/Beregning';
import Sakintro from './sakintro/Sakintro';
import messages from './saksoversikt-nb';
import styles from './saksoversikt.module.less';
import Vilkår from './steg/Vilkår';
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
            } else if (RemoteData.isSuccess(søker)) {
                rerouteToSak(sak.value.id);
            }
        }
    }, [sak._tag, søker._tag]);

    const data = RemoteData.combine(søker, sak);

    const gender = useMemo<Gender>(() => {
        if (RemoteData.isSuccess(søker)) {
            if (søker.value.kjønn === Kjønn.Mann) {
                return Gender.male;
            } else if (søker.value.kjønn === Kjønn.Kvinne) {
                return Gender.female;
            } else {
                return Gender.unknown;
            }
        }
        return Gender.unknown;
    }, [søker._tag]);

    const rerouteToSak = (id: string) => history.push(Routes.saksoversiktValgtSak.createURL({ sakId: id }));

    return (
        <IntlProvider locale={Languages.nb} messages={messages}>
            <Switch>
                <Route path={Routes.saksoversiktValgtSak.path}>
                    {pipe(
                        data,
                        RemoteData.fold(
                            () => null,
                            () => <NavFrontendSpinner />,
                            () =>
                                RemoteData.isFailure(søker) ? (
                                    <AlertStripe type="feil">
                                        {søker.error.code === ErrorCode.Unauthorized
                                            ? intl.formatMessage({ id: 'feilmelding.ikkeTilgang' })
                                            : søker.error.message}
                                    </AlertStripe>
                                ) : (
                                    RemoteData.isFailure(sak) && (
                                        <AlertStripe type="feil">{sak.error.message}</AlertStripe>
                                    )
                                ),
                            ([søker, sak]) => (
                                <>
                                    <div className={styles.headerContainer}>
                                        <PersonCard
                                            fodselsnummer={søker.fnr}
                                            gender={gender}
                                            name={showName(søker)}
                                            renderLabelContent={(): JSX.Element => <PersonAdvarsel person={søker} />}
                                        />
                                        <Søkefelt />
                                    </div>
                                    <div className={styles.container}>
                                        <Switch>
                                            <Route path={Routes.saksoversiktValgtBehandling.path}>
                                                <div className={styles.mainContent}>
                                                    <Switch>
                                                        <Route path={Routes.saksbehandlingBeregning.path}>
                                                            <Beregning sak={sak} />
                                                        </Route>
                                                        <Route path={Routes.saksbehandlingVedtak.path}>
                                                            <Vedtak sak={sak} />
                                                        </Route>
                                                        <Route path={Routes.saksbehandlingVilkårsvurdering.path}>
                                                            <Vilkår sak={sak} />
                                                        </Route>
                                                    </Switch>
                                                </div>
                                            </Route>
                                            <Route path="*">
                                                <Sakintro sak={sak} />
                                                <Hendelseslogg sak={sak} />
                                            </Route>
                                        </Switch>
                                    </div>
                                </>
                            )
                        )
                    )}
                </Route>
                <Route path={Routes.saksoversiktIndex.path}>
                    <div>
                        <Søkefelt />
                        {(RemoteData.isPending(søker) || RemoteData.isPending(sak)) && <NavFrontendSpinner />}
                        {RemoteData.isFailure(søker) ? (
                            <AlertStripe type="feil">
                                {søker.error.code === ErrorCode.Unauthorized
                                    ? intl.formatMessage({ id: 'feilmelding.ikkeTilgang' })
                                    : søker.error.message}
                            </AlertStripe>
                        ) : (
                            RemoteData.isFailure(sak) && <AlertStripe type="feil">{sak.error.message}</AlertStripe>
                        )}
                    </div>
                </Route>
            </Switch>
        </IntlProvider>
    );
};

export default Saksoversikt;
