import * as RemoteData from '@devexperts/remote-data-ts';
import { pipe } from 'fp-ts/lib/function';
import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';

import * as sakSlice from '~features/saksoversikt/sak.slice';
import * as Routes from '~lib/routes';
import { useAppSelector, useAppDispatch } from '~redux/Store';

import styles from './klage.module.less';
import OpprettKlage from './OpprettKlage';
import VurderFormkrav from './VurderFormkrav';

const Klage = () => {
    const urlParams = Routes.useRouteParams<typeof Routes.klageRoute>();

    const { sak } = useAppSelector((s) => ({ søker: s.søker.søker, sak: s.sak.sak }));
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (RemoteData.isInitial(sak)) {
            dispatch(sakSlice.fetchSak({ sakId: urlParams.sakId }));
        }
    }, [sak._tag]);

    return pipe(
        sak,
        RemoteData.fold(
            () => null,
            () => null,
            () => null,
            (s) => (
                <div className={styles.container}>
                    <Switch>
                        <Route path={Routes.klageOpprett.path}>
                            <OpprettKlage />
                        </Route>
                        <Route path={Routes.klageVurderFormkrav.path}>
                            <VurderFormkrav sak={s} />
                        </Route>
                    </Switch>
                </div>
            )
        )
    );
};

export default Klage;
