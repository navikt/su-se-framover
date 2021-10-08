import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Loader } from '@navikt/ds-react';
import React, { useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';

import * as personSlice from '~features/person/person.slice';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import messages from './attestering-nb';
import AttesterRevurdering from './attesterRevurdering/AttesterRevurdering';
import AttesterSøknadsbehandling from './attesterSøknadsbehandling/AttesterSøknadsbehandling';

const Attestering = () => {
    const dispatch = useAppDispatch();
    const urlParams = Routes.useRouteParams<typeof Routes.attestering>();
    const { intl } = useI18n({ messages });
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
            () => <Loader />,
            (_err) => <Alert variant="error">{intl.formatMessage({ id: 'feil.generisk' })}</Alert>,
            ([sakValue, søkerValue]) => {
                return (
                    <Switch>
                        <Route path={Routes.attesterSøknadsbehandling.path}>
                            <AttesterSøknadsbehandling sak={sakValue} søker={søkerValue} />
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
