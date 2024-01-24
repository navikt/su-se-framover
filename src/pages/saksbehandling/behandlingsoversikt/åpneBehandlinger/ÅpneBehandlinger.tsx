import * as RemoteData from '@devexperts/remote-data-ts';
import { Loader } from '@navikt/ds-react';
import { useEffect, useState } from 'react';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { pipe } from '~src/lib/fp';
import { useAsyncActionCreator } from '~src/lib/hooks';
import {
    Filter,
    hentFiltrerteVerdier,
    BehandlingssammendragStatusFilter,
    BehandlingssammendragTypeFilter,
} from '~src/pages/saksbehandling/behandlingsoversikt/filter/Filter';
import BehandlingssammendragTabell from '~src/pages/saksbehandling/behandlingssammendrag/BehandlingssammendragTabell';
import {
    Behandlingssammendrag,
    BehandlingssammendragStatus,
    BehandlingssammendragType,
} from '~src/types/Behandlingssammendrag';

import AntallBehandlinger from '../antallBehandlinger/AntallBehandlinger';

import styles from './åpneBehandlinger.module.less';

export const ÅpneBehandlinger = () => {
    const [hentÅpneBehandlingerStatus, hentÅpneBehandlinger] = useAsyncActionCreator(sakSlice.hentÅpneBehandlinger);

    useEffect(() => {
        hentÅpneBehandlinger();
    }, []);

    const [type, setType] = useState<BehandlingssammendragTypeFilter>({
        [BehandlingssammendragType.SØKNADSBEHANDLING]: false,
        [BehandlingssammendragType.REVURDERING]: false,
        [BehandlingssammendragType.KLAGE]: false,
        [BehandlingssammendragType.REGULERING]: false,
        [BehandlingssammendragType.TILBAKEKREVING]: false,
        [BehandlingssammendragType.KRAVGRUNNLAG]: false,
    });

    const [status, setStatus] = useState<BehandlingssammendragStatusFilter>({
        [BehandlingssammendragStatus.NY_SØKNAD]: false,
        [BehandlingssammendragStatus.UNDER_BEHANDLING]: false,
        [BehandlingssammendragStatus.TIL_ATTESTERING]: false,
        [BehandlingssammendragStatus.UNDERKJENT]: false,
        [BehandlingssammendragStatus.ÅPEN]: false,
    });

    const filterBehandlingssammendrag = (behandlingssammendrag: Behandlingssammendrag[]): Behandlingssammendrag[] => {
        const typefilter = hentFiltrerteVerdier(type);
        const statusfilter = hentFiltrerteVerdier(status);

        return behandlingssammendrag
            .filter((behandlingssammendrag) =>
                typefilter.length ? typefilter.includes(behandlingssammendrag.typeBehandling) : true,
            )
            .filter((behandlingssammendrag) =>
                statusfilter.length
                    ? statusfilter.includes(behandlingssammendrag.status as keyof BehandlingssammendragStatusFilter)
                    : true,
            );
    };

    return (
        <div className={styles.åpnebehandlingerContainer}>
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
                    (behandlingssammendrag: Behandlingssammendrag[]) => (
                        <div>
                            <AntallBehandlinger
                                behandlingssammendrag={filterBehandlingssammendrag(behandlingssammendrag)}
                            />
                            <BehandlingssammendragTabell
                                tabelldata={filterBehandlingssammendrag(behandlingssammendrag)}
                            />
                        </div>
                    ),
                ),
            )}
        </div>
    );
};
