import * as RemoteData from '@devexperts/remote-data-ts';
import { Loader } from '@navikt/ds-react';
import { useEffect, useState } from 'react';

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
    Sakstypefilter,
} from '~src/pages/saksbehandling/behandlingsoversikt/behandlingsfilter/Filter';
import { genererIdForElementer } from '~src/pages/saksbehandling/behandlingsoversikt/åpneBehandlinger/ÅpneBehandlinger.tsx';
import BehandlingssammendragTabell from '~src/pages/saksbehandling/behandlingssammendrag/BehandlingssammendragTabell';
import {
    Behandlingssammendrag,
    BehandlingssammendragMedId,
    BehandlingssammendragStatus,
    BehandlingssammendragType,
} from '~src/types/Behandlingssammendrag';
import { Sakstype } from '~src/types/Sak.ts';
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
        [BehandlingssammendragType.KRAVGRUNNLAG]: false,
        [BehandlingssammendragType.OMGJØRING]: false,
        [BehandlingssammendragType.REVURDERING_OMGJØRING]: false,
    });

    const [resultat, setResultat] = useState<BehandlingssammendragResultatFilter>({
        [BehandlingssammendragStatus.OPPHØR]: false,
        [BehandlingssammendragStatus.AVSLAG]: false,
        [BehandlingssammendragStatus.INNVILGET]: false,
        [BehandlingssammendragStatus.STANS]: false,
        [BehandlingssammendragStatus.GJENOPPTAK]: false,
        [BehandlingssammendragStatus.OVERSENDT]: false,
        [BehandlingssammendragStatus.IVERKSATT]: false,
        [BehandlingssammendragStatus.AVBRUTT]: false,
        [BehandlingssammendragStatus.AVSLUTTET]: false,
    });

    const [sakstypevalg, setSakstype] = useState<Sakstypefilter>({
        [Sakstype.Uføre]: false,
        [Sakstype.Alder]: false,
    });

    //TODO: dette kan legges i redux evt struktureres annerledes så vi slipper å filtreringslogikken her.
    const filtrerBehandlingssammendrag = (
        behandlingssammendrag: BehandlingssammendragMedId[],
    ): BehandlingssammendragMedId[] => {
        const typefilter = hentFiltrerteVerdier(type);
        const resultatfilter = hentFiltrerteVerdier(resultat);
        const saksfilter = hentFiltrerteVerdier(sakstypevalg);
        //TODO: filtrere saksvalg

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
                //todo kanskje behandlingssammendrag.sakType as keyof Sakstypefilter ?
                saksfilter.length ? saksfilter.includes(behandlingssammendrag.sakType) : true,
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
                oppdaterSakstype={(key, verdi) => setSakstype({ ...sakstypevalg, [key]: verdi })}
                saktypeFilter={sakstypevalg}
            />
            {pipe(
                hentFerdigeBehandlingerStatus,
                RemoteData.fold(
                    () => <Loader />,
                    () => <Loader />,
                    (error) => <ApiErrorAlert error={error} />,
                    (behandlingssammendrag: Behandlingssammendrag[]) => {
                        const sammendragMedId = genererIdForElementer(behandlingssammendrag);
                        return (
                            <div>
                                <AntallBehandlinger
                                    filtrerteBehandlinger={filtrerBehandlingssammendrag(sammendragMedId)}
                                    alleBehandligner={sammendragMedId}
                                />
                                <BehandlingssammendragTabell
                                    tabelldata={filtrerBehandlingssammendrag(sammendragMedId)}
                                />
                            </div>
                        );
                    },
                ),
            )}
        </div>
    );
};
