import { Restans, RestansStatus, RestansType } from '~types/Restans';

import messages from './restanser-nb';

export const formatRestansType = (type: RestansType, formatMessage: (string: keyof typeof messages) => string) => {
    switch (type) {
        case RestansType.REVURDERING:
            return formatMessage('restans.typeBehandling.REVURDERING');
        case RestansType.SØKNADSBEHANDLING:
            return formatMessage('restans.typeBehandling.SØKNADSBEHANDLING');
    }
};

export const formatRestansStatus = (
    status: RestansStatus,
    formatMessage: (string: keyof typeof messages) => string
) => {
    switch (status) {
        case RestansStatus.NY_SØKNAD:
            return formatMessage('restans.status.NY_SØKNAD');
        case RestansStatus.TIL_ATTESTERING:
            return formatMessage('restans.status.TIL_ATTESTERING');
        case RestansStatus.UNDERKJENT:
            return formatMessage('restans.status.UNDERKJENT');
        case RestansStatus.UNDER_BEHANDLING:
            return formatMessage('restans.status.UNDER_BEHANDLING');
    }
};

export const filtrerTabell = (restanser: Restans[], filtrerteVerdier: Set<RestansStatus | RestansType>) => {
    if (filtrerteVerdier.size >= 1) {
        return restanser.filter((r) => {
            if (filtrererTypeOgStatus(filtrerteVerdier)) {
                return filtrerTypeOgStatus(r, filtrerteVerdier);
            }

            return filtrerTypeEllerStatus(r, filtrerteVerdier);
        });
    }
    return restanser;
};

const filtrererTypeOgStatus = (filtrerteVerdier: Set<RestansStatus | RestansType>) => {
    const typer = Object.values(RestansType);
    const statuser = Object.values(RestansStatus);

    const hasType = typer.some((t) => filtrerteVerdier.has(t));
    const hasStatus = statuser.some((s) => filtrerteVerdier.has(s));

    return hasType && hasStatus;
};

const filtrerTypeOgStatus = (r: Restans, filtrerteVerdier: Set<RestansStatus | RestansType>) => {
    if (filtrerteVerdier.has(r.status) && filtrerteVerdier.has(r.typeBehandling)) {
        return true;
    }
    return false;
};

const filtrerTypeEllerStatus = (r: Restans, filtrerteVerdier: Set<RestansStatus | RestansType>) => {
    if (filtrerteVerdier.has(r.status) || filtrerteVerdier.has(r.typeBehandling)) {
        return true;
    }
    return false;
};
