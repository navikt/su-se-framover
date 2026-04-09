import * as RemoteData from '@devexperts/remote-data-ts';
import { Loader } from '@navikt/ds-react';
import { useEffect, useState } from 'react';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { pipe } from '~src/lib/fp';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { Nullable } from '~src/lib/types';
import {
    BehandlingssammendragResultatFilter,
    BehandlingssammendragTypeFilter,
    Filter,
    hentFiltrerteVerdier,
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

    const ferdige_behandlinger_type = 'ferdige_behandlinger_type';
    const ferdige_behandlinger_sakType = 'ferdige_behandlinger_sakType';
    const ferdige_behandlinger_resultat = 'ferdige_behandlinger_resultat';

    const defaultTypeFilter: BehandlingssammendragTypeFilter = {
        [BehandlingssammendragType.SØKNADSBEHANDLING]: false,
        [BehandlingssammendragType.REVURDERING]: false,
        [BehandlingssammendragType.KLAGE]: false,
        [BehandlingssammendragType.REGULERING]: false,
        [BehandlingssammendragType.TILBAKEKREVING]: false,
        [BehandlingssammendragType.KRAVGRUNNLAG]: false,
        [BehandlingssammendragType.OMGJØRING]: false,
        [BehandlingssammendragType.REVURDERING_OMGJØRING]: false,
    };

    const defaultResultatFilter: BehandlingssammendragResultatFilter = {
        [BehandlingssammendragStatus.OPPHØR]: false,
        [BehandlingssammendragStatus.AVSLAG]: false,
        [BehandlingssammendragStatus.INNVILGET]: false,
        [BehandlingssammendragStatus.STANS]: false,
        [BehandlingssammendragStatus.GJENOPPTAK]: false,
        [BehandlingssammendragStatus.OVERSENDT]: false,
        [BehandlingssammendragStatus.IVERKSATT]: false,
        [BehandlingssammendragStatus.AVBRUTT]: false,
        [BehandlingssammendragStatus.AVSLUTTET]: false,
    };

    const defaultSaktypeFilter: Sakstypefilter = {
        [Sakstype.Uføre]: false,
        [Sakstype.Alder]: false,
    };

    const [type, setType] = useState<BehandlingssammendragTypeFilter>(() => {
        const lagret = localStorage.getItem(ferdige_behandlinger_type);
        return lagret ? JSON.parse(lagret) : defaultTypeFilter;
    });

    const [resultat, setResultat] = useState<BehandlingssammendragResultatFilter>(() => {
        const lagret = localStorage.getItem(ferdige_behandlinger_resultat);
        return lagret ? JSON.parse(lagret) : defaultResultatFilter;
    });

    const [sakstypevalg, setSakstype] = useState<Sakstypefilter>(() => {
        const lagret = localStorage.getItem(ferdige_behandlinger_sakType);
        return lagret ? JSON.parse(lagret) : defaultSaktypeFilter;
    });

    const oppdaterTypeFilter = (typeFilter: BehandlingssammendragTypeFilter) => {
        setType(typeFilter);
        localStorage.setItem(ferdige_behandlinger_type, JSON.stringify(typeFilter));
    };

    const oppdaterResultatFilter = (resultatFilter: BehandlingssammendragResultatFilter) => {
        setResultat(resultatFilter);
        localStorage.setItem(ferdige_behandlinger_resultat, JSON.stringify(resultatFilter));
    };

    const oppdaterSakstypeFilter = (sakstypeFilter: Sakstypefilter) => {
        setSakstype(sakstypeFilter);
        localStorage.setItem(ferdige_behandlinger_sakType, JSON.stringify(sakstypeFilter));
    };

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
                    oppdaterResultatFilter({
                        ...resultat,
                        [key]: verdi,
                    });
                }}
                oppdaterType={(key, verdi) => {
                    oppdaterTypeFilter({
                        ...type,
                        [key]: verdi,
                    });
                }}
                oppdaterSakstype={(key, verdi) => {
                    oppdaterSakstypeFilter({
                        ...sakstypevalg,
                        [key]: verdi,
                    });
                }}
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
