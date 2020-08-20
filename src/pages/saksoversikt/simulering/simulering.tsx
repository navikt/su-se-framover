import * as RemoteData from '@devexperts/remote-data-ts';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React from 'react';

import { Oppdrag } from '~api/behandlingApi';
import { Sak } from '~api/sakApi';
import { useAppSelector } from '~redux/Store';

interface Props {
    sak: Sak;
    behandlingId: string;
}

const Oppdragssimulering = (props: { oppdrag: Oppdrag }) => {
    return (
        <div>
            <div>Oppdragsid: {props.oppdrag.id} </div>
            <div>Simulering:</div>
            <div>Totalbeløp: {props.oppdrag.simulering.totalBelop} </div>
            <div>Fra og med: {props.oppdrag.simulering.periodeList[0].fom} </div>
            <div>Til og med: {props.oppdrag.simulering.periodeList[0].tom} </div>
        </div>
    );
};

export const Simulering = (props: Props) => {
    const { sak, behandlingId } = props;

    const simuleringStatus = useAppSelector((s) => s.sak.simuleringStatus);
    if (RemoteData.isFailure(simuleringStatus)) {
        return <div>Feilet mens vi hentet oppdrag/simulering</div>;
    } else if (RemoteData.isPending(simuleringStatus)) {
        return <NavFrontendSpinner />;
    }
    const behandling = sak.behandlinger.find((x) => x.id === behandlingId);
    if (!behandling || !behandling.oppdrag) {
        return <div>Behandlingen har ingen oppdrag</div>;
    }
    return <Oppdragssimulering oppdrag={behandling.oppdrag} />;
};
