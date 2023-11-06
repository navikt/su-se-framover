import * as RemoteData from '@devexperts/remote-data-ts';
import { Loader } from '@navikt/ds-react';
import React, { useEffect, useState } from 'react';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { pipe } from '~src/lib/fp';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { Nullable } from '~src/lib/types';
import {
    Filter,
    hentFiltrerteVerdier,
    BehandlingssammendragResultatFilter,
    BehandlingssammendragTypeFilter,
} from '~src/pages/saksbehandling/behandlingsoversikt/filter/Filter';
import BehandlingssammendragTabell from '~src/pages/saksbehandling/behandlingssammendrag/BehandlingssammendragTabell';
import {
    Behandlingssammendrag,
    BehandlingssammendragStatus,
    BehandlingssammendragType,
} from '~src/types/Behandlingssammendrag';
import { toDateOrNull } from '~src/utils/date/dateUtils';

import AntallBehandlinger from '../antallBehandlinger/AntallBehandlinger';

import styles from './ferdigeBehandlinger.module.less';

export const FerdigeBehandlinger = () => {
    const [hentFerdigeBehandlingerStatus, hentFerdigeBehandlinger] = useAsyncActionCreator(
        sakSlice.hentFerdigeBehandlinger,
    );

    useEffect(() => {
        hentFerdigeBehandlinger();
    }, []);

    const tilOgMed = useState<Nullable<Date>>(null);
    const fraOgMed = useState<Nullable<Date>>(null);

    const [type, setType] = useState<BehandlingssammendragTypeFilter>({
        [BehandlingssammendragType.SØKNADSBEHANDLING]: false,
        [BehandlingssammendragType.REVURDERING]: false,
        [BehandlingssammendragType.KLAGE]: false,
        [BehandlingssammendragType.REGULERING]: false,
        [BehandlingssammendragType.TILBAKEKREVING]: false,
    });

    const [resultat, setResultat] = useState<BehandlingssammendragResultatFilter>({
        [BehandlingssammendragStatus.OPPHØR]: false,
        [BehandlingssammendragStatus.AVSLAG]: false,
        [BehandlingssammendragStatus.INNVILGET]: false,
        [BehandlingssammendragStatus.STANS]: false,
        [BehandlingssammendragStatus.GJENOPPTAK]: false,
        [BehandlingssammendragStatus.OVERSENDT]: false,
        [BehandlingssammendragStatus.IVERKSATT]: false,
    });

    const filtrerBehandlingssammendrag = (behandlingssammendrag: Behandlingssammendrag[]): Behandlingssammendrag[] => {
        const typefilter = hentFiltrerteVerdier(type);
        const resultatfilter = hentFiltrerteVerdier(resultat);

        return behandlingssammendrag
            .filter((behandlingssammendrag) =>
                tilOgMed[0] ? (toDateOrNull(behandlingssammendrag.behandlingStartet) ?? '') <= tilOgMed[0] : true,
            )
            .filter((behandlingssammendrag) =>
                fraOgMed[0] ? (toDateOrNull(behandlingssammendrag.behandlingStartet) ?? '') >= fraOgMed[0] : true,
            )
            .filter((behandlingssammendrag) =>
                typefilter.length ? typefilter.includes(behandlingssammendrag.typeBehandling) : true,
            )
            .filter((behandlingssammendrag) =>
                resultatfilter.length
                    ? resultatfilter.includes(behandlingssammendrag.status as keyof BehandlingssammendragResultatFilter)
                    : true,
            );
    };

    return (
        <div className={styles.ferdigeBehandlingerContainer}>
            <Filter
                type={type}
                resultat={resultat}
                tilOgMedState={tilOgMed}
                fraOgMedState={fraOgMed}
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
            />
            {pipe(
                hentFerdigeBehandlingerStatus,
                RemoteData.fold(
                    () => <Loader />,
                    () => <Loader />,
                    (error) => <ApiErrorAlert error={error} />,
                    (behandlingssammendrag: Behandlingssammendrag[]) => (
                        <div>
                            <AntallBehandlinger
                                behandlingssammendrag={filtrerBehandlingssammendrag(behandlingssammendrag)}
                            />
                            <BehandlingssammendragTabell
                                tabelldata={filtrerBehandlingssammendrag(behandlingssammendrag)}
                            />
                        </div>
                    ),
                ),
            )}
        </div>
    );
};
