import React, { useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { Route, useHistory, useParams, useRouteMatch, Switch } from 'react-router-dom';
import AlertStripe from 'nav-frontend-alertstriper';

import * as RemoteData from '@devexperts/remote-data-ts';
import { PersonCard } from '@navikt/nap-person-card';
import SideMenu from '@navikt/nap-side-menu';

import NavFrontendSpinner from 'nav-frontend-spinner';

import { Languages } from '~components/TextProvider';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import { pipe } from '~lib/fp';

import messages from './saksoversikt-nb';
import Søkefelt from './søkefelt/Søkefelt';
import { SaksbehandligMenyValg } from './types';

import styles from './saksoversikt.module.less';
import Sakintro from './sakintro/Sakintro';
import Vilkår from './vilkår/Vilkår';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import * as personSlice from '~features/person/person.slice';

const Saksoversikt = () => {
    const { meny, ...urlParams } = useParams<{
        meny: SaksbehandligMenyValg;
        sakId: string;
        stonadsperiodeId: string;
        behandlingId: string;
    }>();
    const { path } = useRouteMatch();

    const { søker, sak } = useAppSelector((s) => ({ søker: s.søker.søker, sak: s.sak.sak }));
    const history = useHistory();
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

    return (
        <IntlProvider locale={Languages.nb} messages={messages}>
            {!RemoteData.isSuccess(data) && (
                <div>
                    <Søkefelt />
                    {RemoteData.isPending(data) && <NavFrontendSpinner />}
                    {RemoteData.isFailure(data) && <AlertStripe type="feil">{data.error.message}</AlertStripe>}
                </div>
            )}

            {pipe(
                data,
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
                            {meny && (
                                <SideMenu
                                    links={[
                                        {
                                            label: 'Søknad',
                                            active: meny === SaksbehandligMenyValg.Søknad,
                                        },
                                        {
                                            label: 'Vilkår',
                                            active: meny === SaksbehandligMenyValg.Vilkår,
                                        },
                                        {
                                            label: 'Behandling',
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
                                                history.push(
                                                    `/saksoversikt/${sak.id}/${urlParams.behandlingId}/soknad/`
                                                );
                                                return;
                                            case 1:
                                                history.push(
                                                    `/saksoversikt/${sak.id}/${urlParams.behandlingId}/vilkar`
                                                );
                                                return;
                                            case 2:
                                                history.push(
                                                    `/saksoversikt/${sak.id}/${urlParams.behandlingId}/behandling`
                                                );
                                                return;
                                            case 3:
                                                history.push(
                                                    `/saksoversikt/${sak.id}/${urlParams.behandlingId}/vedtak`
                                                );
                                                return;
                                        }
                                    }}
                                />
                            )}
                            <div className={styles.mainContent}>
                                <Switch>
                                    <Route
                                        path={`/saksoversikt/:sakId?/:behandlingId?/${SaksbehandligMenyValg.Søknad}`}
                                    >
                                        Her kan vi kanskje vise hele søknaden
                                    </Route>
                                    <Route
                                        path={`/saksoversikt/:sakId?/:behandlingId?/${SaksbehandligMenyValg.Vilkår}`}
                                    >
                                        <Vilkår
                                            sakId={sak.id}
                                            behandling={sak.behandlinger.find((b) => b.id === urlParams.behandlingId)}
                                        />
                                    </Route>
                                    <Route
                                        path={`/saksoversikt/:sakId?/:behandlingId?/${SaksbehandligMenyValg.Behandlig}`}
                                    >
                                        behandling
                                    </Route>
                                    <Route
                                        path={`/saksoversikt/:sakId?/:behandlingId?/${SaksbehandligMenyValg.Vedtak}`}
                                    >
                                        vedtak
                                    </Route>
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
