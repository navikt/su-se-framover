import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Loader } from '@navikt/ds-react';
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import Personlinje from '~src/components/personlinje/Personlinje';
import * as personSlice from '~src/features/person/person.slice';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { pipe } from '~src/lib/fp';
import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';

import messages from './attestering-nb';
import * as styles from './attestering.module.less';

const Attestering = () => {
    const dispatch = useAppDispatch();
    const urlParams = routes.useRouteParams<typeof routes.attestering>();
    const { formatMessage } = useI18n({ messages });
    const { sak, søker } = useAppSelector((s) => ({ sak: s.sak.sak, søker: s.søker.søker }));

    useEffect(() => {
        if (RemoteData.isInitial(sak) && urlParams.sakId) {
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
            (_err) => <Alert variant="error">{formatMessage('feil.generisk')}</Alert>,
            ([sakValue, søkerValue]) => (
                <div className={styles.attesteringsSideContainer}>
                    <Personlinje
                        søker={søkerValue}
                        sakInfo={{
                            sakId: sakValue.id,
                            saksnummer: sakValue.saksnummer,
                        }}
                    />
                    <div className={styles.attesteringsKomponentContainer}>
                        <Outlet context={{ sak: sakValue, søker: søkerValue }} />
                    </div>
                </div>
            )
        )
    );
};

export default Attestering;
