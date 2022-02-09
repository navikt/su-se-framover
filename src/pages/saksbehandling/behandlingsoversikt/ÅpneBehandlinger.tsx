import * as RemoteData from '@devexperts/remote-data-ts';
import { RemoteFailure, RemoteInitial, RemotePending, RemoteSuccess } from '@devexperts/remote-data-ts';
import { Alert, Heading, Loader } from '@navikt/ds-react';
import Tabs from 'nav-frontend-tabs';
import React, { useEffect, useState } from 'react';

import { ApiError } from '~api/apiClient';
import { Person } from '~api/personApi';
import { Person as PersonIkon } from '~assets/Icons';
import { visErrorMelding } from '~components/apiErrorAlert/utils';
import Personsøk from '~components/Personsøk/Personsøk';
import * as personSlice from '~features/person/person.slice';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import { Filter, FilterCheckbox, hentFiltrerteVerdier } from '~pages/saksbehandling/behandlingsoversikt/Filter';
import RestanserTabell from '~pages/saksbehandling/restans/Restanser';
import { useAppDispatch } from '~redux/Store';
import { Restans, RestansStatus, RestansType } from '~types/Restans';
import { Sak } from '~types/Sak';

import { isRestansStatus, isRestansType } from '../restans/restanserUtils';

import messages from './åpneBehandlinger-nb';
import styles from './åpneBehandlinger.module.less';

interface Props {
    søker: RemoteInitial | RemotePending | RemoteFailure<ApiError> | RemoteSuccess<Person>;
    sak: RemoteInitial | RemotePending | RemoteFailure<ApiError> | RemoteSuccess<Sak>;
}

enum Tab {
    ÅPNE_BEHANDLINGER,
}

export const ÅpneBehandlinger = ({ sak, søker }: Props) => {
    const dispatch = useAppDispatch();
    const [hentÅpneBehandlingerStatus, hentÅpneBehandlinger] = useAsyncActionCreator(sakSlice.hentRestanser);

    useEffect(() => {
        hentÅpneBehandlinger();
    }, []);

    const { formatMessage } = useI18n({ messages });

    const [aktivTab, setAktivTab] = useState<Tab>(Tab.ÅPNE_BEHANDLINGER);
    const [filter, setFilter] = useState<FilterCheckbox>({
        [RestansType.SØKNADSBEHANDLING]: false,
        [RestansType.REVURDERING]: false,
        [RestansType.KLAGE]: false,
        [RestansStatus.NY_SØKNAD]: false,
        [RestansStatus.UNDER_BEHANDLING]: false,
        [RestansStatus.TIL_ATTESTERING]: false,
        [RestansStatus.UNDERKJENT]: false,
    });

    const filterRestanser = (restanser: Restans[], filter: FilterCheckbox): Restans[] => {
        const filtre = hentFiltrerteVerdier(filter);
        const skalFiltrerePåType = filtre.filter(isRestansType).length !== 0;
        const skalFiltrerePåStatus = filtre.filter(isRestansStatus).length !== 0;

        return restanser
            .filter((restans) => (skalFiltrerePåType ? filtre.includes(restans.typeBehandling) : true))
            .filter((restans) => (skalFiltrerePåStatus ? filtre.includes(restans.status) : true));
    };

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
                tabs={[{ label: formatMessage('åpneBehandlinger') }]}
                defaultAktiv={aktivTab}
                onChange={(_, index) => setAktivTab(index)}
            />
            <div className={styles.tabcontainer}>
                <Filter
                    filterState={filter}
                    oppdaterFilter={(key: keyof FilterCheckbox, verdi: boolean) => {
                        setFilter({
                            ...filter,
                            [key]: verdi,
                        });
                    }}
                    formatMessage={formatMessage}
                />
                {pipe(
                    hentÅpneBehandlingerStatus,
                    RemoteData.fold(
                        () => <Loader />,
                        () => <Loader />,
                        () => <Alert variant="error">{formatMessage('feilmelding.feilOppstod')}</Alert>,
                        (restanser: Restans[]) => <RestanserTabell tabelldata={filterRestanser(restanser, filter)} />
                    )
                )}
            </div>
        </div>
    );
};
