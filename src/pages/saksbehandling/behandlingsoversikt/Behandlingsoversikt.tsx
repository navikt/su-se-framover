import * as RemoteData from '@devexperts/remote-data-ts';
import { RemoteFailure, RemoteInitial, RemotePending, RemoteSuccess } from '@devexperts/remote-data-ts';
import { Alert, Heading } from '@navikt/ds-react';
import Tabs from 'nav-frontend-tabs';
import React, { useState } from 'react';

import { ApiError } from '~api/apiClient';
import { Person } from '~api/personApi';
import { Person as PersonIkon } from '~assets/Icons';
import { visErrorMelding } from '~components/apiErrorAlert/utils';
import Personsøk from '~components/Personsøk/Personsøk';
import * as personSlice from '~features/person/person.slice';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useI18n } from '~lib/i18n';
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
                    <Alert variant="error">{visErrorMelding(sak.error, formatMessage)}</Alert>
                )}
            </div>

            <Tabs
                tabs={[{ label: formatMessage('åpneBehandlinger') }, { label: formatMessage('nøkkeltall') }]}
                defaultAktiv={aktivTab}
                onChange={(_, index) => setAktivTab(index)}
            />
            <div className={styles.tabcontainer}>
                {aktivTab === Tab.ÅPNE_BEHANDLINGER && <ÅpneBehandlinger />}
                {aktivTab === Tab.NØKKELTALL && <Nøkkeltall />}
            </div>
        </div>
    );
};
