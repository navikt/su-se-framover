import { ÅpenBehandlingStatus, ÅpenBehandlingType } from '~types/Sak';

import messages from './åpneBehandlinger-nb';

export const formatÅpenBehandlingsType = (
    type: ÅpenBehandlingType,
    formatMessage: (string: keyof typeof messages) => string
) => {
    switch (type) {
        case ÅpenBehandlingType.REVURDERING:
            return formatMessage('behandling.typeBehandling.revurdering');
        case ÅpenBehandlingType.SØKNADSBEHANDLING:
            return formatMessage('behandling.typeBehandling.søknadsbehandling');
    }
};

export const formatÅpenBehandlignsStatus = (
    status: ÅpenBehandlingStatus,
    formatMessage: (string: keyof typeof messages) => string
) => {
    switch (status) {
        case ÅpenBehandlingStatus.NY_SØKNAD:
            return formatMessage('behandling.status.nySøknad');
        case ÅpenBehandlingStatus.TIL_ATTESTERING:
            return formatMessage('behandling.status.tilAttestering');
        case ÅpenBehandlingStatus.UNDERKJENT:
            return formatMessage('behandling.status.underkjent');
        case ÅpenBehandlingStatus.UNDER_BEHANDLING:
            return formatMessage('behandling.status.underBehandling');
    }
};
