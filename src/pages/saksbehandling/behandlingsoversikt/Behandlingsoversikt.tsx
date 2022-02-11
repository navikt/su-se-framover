import * as RemoteData from '@devexperts/remote-data-ts';
import { RemoteFailure, RemoteInitial, RemotePending, RemoteSuccess } from '@devexperts/remote-data-ts';
import { Heading } from '@navikt/ds-react';
import Tabs from 'nav-frontend-tabs';
import React, { useState } from 'react';

import { ApiError } from '~api/apiClient';
import { Person } from '~api/personApi';
import { Person as PersonIkon } from '~assets/Icons';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import Personsøk from '~components/Personsøk/Personsøk';
import * as personSlice from '~features/person/person.slice';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useI18n } from '~lib/i18n';
import { FerdigeBehandlinger } from '~pages/saksbehandling/behandlingsoversikt/ferdigeBehandlinger/FerdigeBehandlinger';
import { useAppDispatch } from '~redux/Store';
import { Sak } from '~types/Sak';

import styles from './behandlingsoversikt.module.less';
import Nøkkeltall from './nøkkeltall/Nøkkeltall';
import { ÅpneBehandlinger } from './åpneBehandlinger/ÅpneBehandlinger';
import messages from './åpneBehandlinger/åpneBehandlinger-nb';

interface Props {
    søker: RemoteInitial | RemotePending | RemoteFailure<ApiError> | RemoteSuccess<Person>;
    sak: RemoteInitial | RemotePending | RemoteFailure<ApiError> | RemoteSuccess<Sak>;
}

enum Tab {
    ÅPNE_BEHANDLINGER,
    FERDIGE_BEHANDLINGER,
    NØKKELTALL,
}

export const Behandlingsoversikt = ({ sak, søker }: Props) => {
    const dispatch = useAppDispatch();
    const { formatMessage } = useI18n({ messages });

    const [aktivTab, setAktivTab] = useState<Tab>(Tab.ÅPNE_BEHANDLINGER);

    return (
        <div className={styles.saksoversiktForside}>
            <div className={styles.personsøk}>
                <Heading level="1" size="xlarge" spacing className={styles.finnSak}>
                    <PersonIkon />
                    {formatMessage('finnSak')}
                </Heading>
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
                    <ApiErrorAlert className={styles.alert} error={sak.error} />
                )}
            </div>

            <Tabs
                tabs={[
                    { label: formatMessage('åpneBehandlinger') },
                    { label: formatMessage('ferdigeBehandlinger') },
                    { label: formatMessage('nøkkeltall') },
                ]}
                defaultAktiv={aktivTab}
                onChange={(_, index) => setAktivTab(index)}
            />
            <div className={styles.tabcontainer}>
                {aktivTab === Tab.ÅPNE_BEHANDLINGER && <ÅpneBehandlinger />}
                {aktivTab === Tab.FERDIGE_BEHANDLINGER && <FerdigeBehandlinger />}
                {aktivTab === Tab.NØKKELTALL && <Nøkkeltall />}
            </div>
        </div>
    );
};
