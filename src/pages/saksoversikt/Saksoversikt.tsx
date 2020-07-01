import React from 'react';
import { IntlProvider } from 'react-intl';
import { Route, useHistory, useParams, useRouteMatch, Switch } from 'react-router-dom';
import AlertStripe from 'nav-frontend-alertstriper';

import * as RemoteData from '@devexperts/remote-data-ts';
import { PersonCard } from '@navikt/nap-person-card';
import SideMenu from '@navikt/nap-side-menu';

import NavFrontendSpinner from 'nav-frontend-spinner';

import { Languages } from '~components/TextProvider';
import { useAppSelector } from '~redux/Store';
import { pipe } from '~lib/fp';

import messages from './saksoversikt-nb';
import Søkefelt from './søkefelt/Søkefelt';
import { SaksbehandligMenyValg } from './types';

import styles from './saksoversikt.module.less';
import Sakintro from './sakintro/Sakintro';
import Vilkår from './vilkår/Vilkår';

const Saksoversikt = () => {
    const { meny } = useParams<{ meny: SaksbehandligMenyValg }>();
    const { path } = useRouteMatch();
    const søkerFraStore = useAppSelector((s) => s.søker.søker);
    const sakFraStore = useAppSelector((s) => s.sak.sak);
    const history = useHistory();

    return (
        <IntlProvider locale={Languages.nb} messages={messages}>
            {!RemoteData.isSuccess(søkerFraStore) && (
                <div>
                    <Søkefelt />
                    {RemoteData.isPending(søkerFraStore) && <NavFrontendSpinner />}
                    {RemoteData.isFailure(søkerFraStore) && (
                        <AlertStripe type="feil">{søkerFraStore.error.message}</AlertStripe>
                    )}
                </div>
            )}

            {pipe(
                RemoteData.combine(søkerFraStore, sakFraStore),
                RemoteData.map(([data, sak]) => (
                    <>
                        <div className={styles.headerContainer}>
                            <PersonCard
                                fodselsnummer={data.fnr}
                                gender="unknown"
                                name={`${data.fornavn} ${data.etternavn}`}
                            />
                            <Søkefelt />
                        </div>
                        <div className={styles.container}>
                            <SideMenu
                                links={[
                                    {
                                        label: 'Sak',
                                        active: meny === undefined,
                                    },
                                    {
                                        label: 'Søknad',
                                        active: meny === SaksbehandligMenyValg.Søknad,
                                    },
                                    {
                                        label: 'Vilkår',
                                        active: meny === SaksbehandligMenyValg.Vilkår,
                                    },
                                    {
                                        label: 'Behandlig',
                                        active: meny === SaksbehandligMenyValg.Behandlig,
                                    },
                                    {
                                        label: 'Vedtak',
                                        active: meny === SaksbehandligMenyValg.Vedtak,
                                    },
                                ]}
                                onClick={(index) => {
                                    switch (index) {
                                        case 0:
                                            history.push(`/saksoversikt`);
                                            return;
                                        case 1:
                                            history.push(`/saksoversikt/soknad`);
                                            return;
                                        case 2:
                                            history.push(`/saksoversikt/vilkar`);
                                            return;
                                        case 3:
                                            history.push(`/saksoversikt/behandling`);
                                            return;
                                        case 4:
                                            history.push(`/saksoversikt/vedtak`);
                                            return;
                                    }
                                }}
                            />
                            <div className={styles.mainContent}>
                                <Switch>
                                    <Route path={`${path}/${SaksbehandligMenyValg.Søknad}`}>heisann</Route>
                                    <Route path={`${path}/${SaksbehandligMenyValg.Vilkår}`}>
                                        <Vilkår sak={sak} />
                                    </Route>
                                    <Route path={`${path}/${SaksbehandligMenyValg.Behandlig}`}>behandling</Route>
                                    <Route path={`${path}/${SaksbehandligMenyValg.Vedtak}`}>vedtak</Route>
                                    <Route path={path}>
                                        <Sakintro sak={sak} />
                                    </Route>
                                </Switch>
                            </div>
                        </div>
                    </>
                )),
                RemoteData.getOrElse(() => <span />)
            )}
        </IntlProvider>
    );
};

export default Saksoversikt;
