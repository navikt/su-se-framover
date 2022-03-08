import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyShort, Label, Loader } from '@navikt/ds-react';
import React, { useEffect, useState } from 'react';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import {
    Filter,
    hentFiltrerteVerdier,
    RestansStatusFilter,
    RestansTypeFilter,
} from '~pages/saksbehandling/behandlingsoversikt/filter/Filter';
import RestanserTabell from '~pages/saksbehandling/restans/Restanser';
import { Restans, RestansStatus, RestansType } from '~types/Restans';

import messages from '../behandlingsoversikt-nb';

import styles from './åpneBehandlinger.module.less';

export const ÅpneBehandlinger = () => {
    const { formatMessage } = useI18n({ messages });
    const [hentÅpneBehandlingerStatus, hentÅpneBehandlinger] = useAsyncActionCreator(sakSlice.hentÅpneBehandlinger);

    useEffect(() => {
        hentÅpneBehandlinger();
    }, []);

    const [type, setType] = useState<RestansTypeFilter>({
        [RestansType.SØKNADSBEHANDLING]: false,
        [RestansType.REVURDERING]: false,
        [RestansType.KLAGE]: false,
    });

    const [status, setStatus] = useState<RestansStatusFilter>({
        [RestansStatus.NY_SØKNAD]: false,
        [RestansStatus.UNDER_BEHANDLING]: false,
        [RestansStatus.TIL_ATTESTERING]: false,
        [RestansStatus.UNDERKJENT]: false,
    });

    const filterRestanser = (restanser: Restans[]): Restans[] => {
        const typefilter = hentFiltrerteVerdier(type);
        const statusfilter = hentFiltrerteVerdier(status);

        return restanser
            .filter((restans) => (typefilter.length ? typefilter.includes(restans.typeBehandling) : true))
            .filter((restans) =>
                statusfilter.length ? statusfilter.includes(restans.status as keyof RestansStatusFilter) : true
            );
    };

    const AntallBehandlinger = (args: { restanser: Restans[] }) => {
        return args.restanser.length > 0 ? (
            <div className={styles.antallBehandlingerContainer}>
                <Label>{args.restanser.length}</Label> <BodyShort>{formatMessage('behandlinger')}</BodyShort>
            </div>
        ) : null;
    };

    return (
        <>
            <Filter
                type={type}
                status={status}
                oppdaterStatus={(key, verdi) => setStatus({ ...status, [key]: verdi })}
                oppdaterType={(key, verdi) => setType({ ...type, [key]: verdi })}
            />

            {pipe(
                hentÅpneBehandlingerStatus,
                RemoteData.fold(
                    () => <Loader />,
                    () => <Loader />,
                    (error) => <ApiErrorAlert error={error} />,
                    (restanser: Restans[]) => (
                        <div>
                            <AntallBehandlinger restanser={filterRestanser(restanser)} />
                            <RestanserTabell tabelldata={filterRestanser(restanser)} />
                        </div>
                    )
                )
            )}
        </>
    );
};
