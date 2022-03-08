import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyShort, Label, Loader } from '@navikt/ds-react';
import React, { useEffect, useState } from 'react';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import { Nullable } from '~lib/types';
import {
    Filter,
    hentFiltrerteVerdier,
    RestansResultatFilter,
    RestansTypeFilter,
} from '~pages/saksbehandling/behandlingsoversikt/filter/Filter';
import RestanserTabell from '~pages/saksbehandling/restans/Restanser';
import { Restans, RestansStatus, RestansType } from '~types/Restans';
import { toDateOrNull } from '~utils/date/dateUtils';

import messages from '../behandlingsoversikt-nb';

import styles from './ferdigeBehandlinger.module.less';

export const FerdigeBehandlinger = () => {
    const { formatMessage } = useI18n({ messages });
    const [hentFerdigeBehandlingerStatus, hentFerdigeBehandlinger] = useAsyncActionCreator(
        sakSlice.hentFerdigeBehandlinger
    );

    useEffect(() => {
        hentFerdigeBehandlinger();
    }, []);

    const tilOgMed = useState<Nullable<Date>>(null);
    const fraOgMed = useState<Nullable<Date>>(null);

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
        [RestansStatus.STANS]: false,
        [RestansStatus.GJENOPPTAK]: false,
        [RestansStatus.OVERSENDT]: false,
    });

    const filtrerRestanser = (restanser: Restans[]): Restans[] => {
        const typefilter = hentFiltrerteVerdier(type);
        const resultatfilter = hentFiltrerteVerdier(resultat);

        return restanser
            .filter((restans) => (tilOgMed[0] ? (toDateOrNull(restans.behandlingStartet) ?? '') <= tilOgMed[0] : true))
            .filter((restans) => (fraOgMed[0] ? (toDateOrNull(restans.behandlingStartet) ?? '') >= fraOgMed[0] : true))
            .filter((restans) => (typefilter.length ? typefilter.includes(restans.typeBehandling) : true))
            .filter((restans) =>
                resultatfilter.length ? resultatfilter.includes(restans.status as keyof RestansResultatFilter) : true
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
                    (restanser: Restans[]) => (
                        <div>
                            <AntallBehandlinger restanser={filtrerRestanser(restanser)} />
                            <RestanserTabell tabelldata={filtrerRestanser(restanser)} />
                        </div>
                    )
                )
            )}
        </>
    );
};
