import * as RemoteData from '@devexperts/remote-data-ts';
import AlertStripe from 'nav-frontend-alertstriper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';

import * as personSlice from '~features/person/person.slice';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import AttesterBehandling from './attesterBehandling/AttesterBehandling';
import messages from './attestering-nb';
import AttesterRevurdering from './attesterRevurdering/AttesterRevurdering';

const Attestering = () => {
    const dispatch = useAppDispatch();
    const urlParams = Routes.useRouteParams<typeof Routes.attestering>();
    const intl = useI18n({ messages });
    const { sak, søker } = useAppSelector((s) => ({ sak: s.sak.sak, søker: s.søker.søker }));

    useEffect(() => {
        if (RemoteData.isInitial(sak)) {
            dispatch(sakSlice.fetchSak({ sakId: urlParams.sakId }));
        }
    }, [sak._tag]);

    useEffect(() => {
        if (RemoteData.isSuccess(sak) && RemoteData.isInitial(søker)) {
            dispatch(personSlice.fetchPerson({ fnr: sak.value.fnr }));
        }
    }, [søker._tag, sak._tag]);

    return pipe(
        RemoteData.combine(sak, søker),
        RemoteData.fold(
            () => null,
            () => <NavFrontendSpinner />,
            (_err) => <AlertStripe type="feil">{intl.formatMessage({ id: 'feil.generisk' })}</AlertStripe>,
            ([sakValue, søkerValue]) => {
                return (
                    <Switch>
                        <Route path={Routes.attesterBehandling.path}>
                            <AttesterBehandling sak={sakValue} søker={søkerValue} />
                        </Route>
                        <Route path={Routes.attesterRevurdering.path}>
                            <AttesterRevurdering sak={sakValue} søker={søkerValue} />
                        </Route>
                    </Switch>
                );
            }
        )
    );
};

export default Attestering;
