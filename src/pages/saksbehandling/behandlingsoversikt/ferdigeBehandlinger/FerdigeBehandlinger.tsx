import * as RemoteData from '@devexperts/remote-data-ts';
import { Loader } from '@navikt/ds-react';
import React, { useEffect, useState } from 'react';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import {
    Filter,
    hentFiltrerteVerdier,
    RestansResultatFilter,
    RestansTypeFilter,
} from '~pages/saksbehandling/behandlingsoversikt/filter/Filter';
import RestanserTabell from '~pages/saksbehandling/restans/Restanser';
import { Restans, RestansStatus, RestansType } from '~types/Restans';

import messages from './ferdigeBehandlinger-nb';

export const FerdigeBehandlinger = () => {
    const [hentFerdigeBehandlingerStatus, hentFerdigeBehandlinger] = useAsyncActionCreator(
        sakSlice.hentFerdigeBehandlinger
    );

    useEffect(() => {
        hentFerdigeBehandlinger();
    }, []);

    const { formatMessage } = useI18n({ messages });

    const [type, setType] = useState<RestansTypeFilter>({
        [RestansType.SØKNADSBEHANDLING]: false,
        [RestansType.REVURDERING]: false,
        [RestansType.KLAGE]: false,
    });

    const [resultat, setResultat] = useState<RestansResultatFilter>({
        [RestansStatus.OPPHØR]: false,
        [RestansStatus.AVSLAG]: false,
        [RestansStatus.INGEN_ENDRING]: false,
        [RestansStatus.INNVILGET]: false,
        [RestansStatus.AVSLUTTET]: false,
    });

    const filterRestanser = (restanser: Restans[]): Restans[] => {
        const typefilter = hentFiltrerteVerdier(type);
        const resultatfilter = hentFiltrerteVerdier(resultat);

        return restanser
            .filter((restans) => (typefilter.length ? typefilter.includes(restans.typeBehandling) : true))
            .filter((restans) =>
                resultatfilter.length ? resultatfilter.includes(restans.status as keyof RestansResultatFilter) : true
            );
    };

    return (
        <>
            <Filter
                type={type}
                resultat={resultat}
                oppdaterResultat={(key, verdi) => {
                    setResultat({
                        ...resultat,
                        [key]: verdi,
                    });
                }}
                oppdaterType={(key, verdi) => {
                    setType({
                        ...type,
                        [key]: verdi,
                    });
                }}
                formatMessage={formatMessage}
            />
            {pipe(
                hentFerdigeBehandlingerStatus,
                RemoteData.fold(
                    () => <Loader />,
                    () => <Loader />,
                    (error) => <ApiErrorAlert error={error} />,
                    (restanser: Restans[]) => <RestanserTabell tabelldata={filterRestanser(restanser)} />
                )
            )}
        </>
    );
};
