import * as RemoteData from '@devexperts/remote-data-ts';
import { PersonCard, Gender } from '@navikt/nap-person-card';
import classNames from 'classnames';
import AlertStripe from 'nav-frontend-alertstriper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { Route, Switch, useHistory } from 'react-router-dom';

import { Kjønn } from '~api/personApi';
import { Sak } from '~api/sakApi';
import { Languages } from '~components/TextProvider';
import * as personSlice from '~features/person/person.slice';
import { showName } from '~features/person/personUtils';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import * as Routes from '~lib/routes';
import { useAppSelector, useAppDispatch } from '~redux/Store';

import Beregning from './beregning/Beregning';
import Sakintro from './sakintro/Sakintro';
import messages from './saksoversikt-nb';
import styles from './saksoversikt.module.less';
import Søkefelt from './søkefelt/Søkefelt';
import { SaksbehandlingMenyvalg } from './types';
import Vedtak from './vedtak/Vedtak';
import Vilkår from './vilkår/Vilkår';

const Meny = () => {
    const urlParams = Routes.useRouteParams<typeof Routes.saksoversiktValgtBehandling>();
    return (
        <div className={styles.meny}>
            <ol>
                <li
                    className={classNames(styles.menyItem, {
                        [styles.aktiv]: urlParams.meny === SaksbehandlingMenyvalg.Vilkår,
                    })}
                >
                    1.&nbsp; Vilkår
                </li>
                <li
                    className={classNames(styles.menyItem, {
                        [styles.aktiv]: urlParams.meny === SaksbehandlingMenyvalg.Beregning,
                    })}
                >
                    2.&nbsp; Beregning
                </li>
                <li
                    className={classNames(styles.menyItem, {
                        [styles.aktiv]: urlParams.meny === SaksbehandlingMenyvalg.Vedtak,
                    })}
                >
                    3.&nbsp; Vedtak
                </li>
            </ol>
        </div>
    );
};

const Behandling = ({ sak }: { sak: Sak }) => {
    const { meny, behandlingId } = Routes.useRouteParams<typeof Routes.saksoversiktValgtBehandling>();
    switch (meny) {
        case SaksbehandlingMenyvalg.Beregning:
            return <Beregning sak={sak} />;
        case SaksbehandlingMenyvalg.Vedtak:
            return <Vedtak sak={sak} />;
        case SaksbehandlingMenyvalg.Vilkår:
            return <Vilkår sakId={sak.id} behandling={sak.behandlinger.find((b) => b.id === behandlingId)} />;
        default:
            return <div>404</div>;
    }
};

const Saksoversikt = () => {
    const urlParams = Routes.useRouteParams<typeof Routes.saksoversiktValgtSak>();
    const history = useHistory();

    const { søker, sak } = useAppSelector((s) => ({ søker: s.søker.søker, sak: s.sak.sak }));
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (urlParams.sakId && RemoteData.isInitial(sak)) {
            dispatch(sakSlice.fetchSak({ sakId: urlParams.sakId }));
        }
    }, [sak._tag]);
    useEffect(() => {
        if (RemoteData.isSuccess(sak) && RemoteData.isInitial(søker)) {
            dispatch(personSlice.fetchPerson({ fnr: sak.value.fnr }));
        }
    }, [sak._tag, søker._tag]);

    const data = RemoteData.combine(søker, sak);

    const oversettKjønn = () => {
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
    };

    const [gender, setGender] = useState<Gender>(Gender.unknown);
    useEffect(() => {
        setGender(oversettKjønn());
    }, [søker._tag]);
    const rerouteToSak = (id: string) => history.push(Routes.saksoversiktValgtSak.createURL({ sakId: id }));

    return (
        <IntlProvider locale={Languages.nb} messages={messages}>
            <Switch>
                <Route path={Routes.saksoversiktValgtSak.path}>
                    {pipe(
                        data,
                        RemoteData.map(([søker, sak]) => (
                            <>
                                <div className={styles.headerContainer}>
                                    <PersonCard fodselsnummer={søker.fnr} gender={gender} name={showName(søker)} />
                                    <Søkefelt onSuccess={rerouteToSak} />
                                </div>
                                <div className={styles.container}>
                                    <Switch>
                                        <Route path={Routes.saksoversiktValgtBehandling.path}>
                                            <Meny />
                                            <div className={styles.mainContent}>
                                                <Behandling sak={sak} />
                                            </div>
                                        </Route>
                                        <Route path="*">
                                            <Sakintro sak={sak} />
                                        </Route>
                                    </Switch>
                                </div>
                            </>
                        )),
                        RemoteData.getOrElse(() => <NavFrontendSpinner />)
                    )}
                </Route>
                <Route path={Routes.saksoversiktIndex.path}>
                    <div>
                        <Søkefelt onSuccess={rerouteToSak} />
                        {RemoteData.isPending(data) && <NavFrontendSpinner />}
                        {RemoteData.isFailure(data) && <AlertStripe type="feil">{data.error.message}</AlertStripe>}
                    </div>
                </Route>
            </Switch>
        </IntlProvider>
    );
};

export default Saksoversikt;
