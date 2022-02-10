import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Loader } from '@navikt/ds-react';
import React, { useEffect, useState } from 'react';

import * as sakSlice from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import { Filter, FilterCheckbox, hentFiltrerteVerdier } from '~pages/saksbehandling/behandlingsoversikt/filter/Filter';
import RestanserTabell from '~pages/saksbehandling/restans/Restanser';
import { Restans, RestansStatus, RestansType } from '~types/Restans';

import { isRestansStatus, isRestansType } from '../../restans/restanserUtils';

import messages from './åpneBehandlinger-nb';

export const ÅpneBehandlinger = () => {
    const [hentÅpneBehandlingerStatus, hentÅpneBehandlinger] = useAsyncActionCreator(sakSlice.hentRestanser);

    useEffect(() => {
        hentÅpneBehandlinger();
    }, []);

    const { formatMessage } = useI18n({ messages });

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
        <>
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
        </>
    );
};
