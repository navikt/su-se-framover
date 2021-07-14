import { RestansStatus, RestansType } from '~types/Restans';

import messages from './restanser-nb';

export const formatRestansType = (type: RestansType, formatMessage: (string: keyof typeof messages) => string) => {
    switch (type) {
        case RestansType.REVURDERING:
            return formatMessage('behandling.typeBehandling.revurdering');
        case RestansType.SØKNADSBEHANDLING:
            return formatMessage('behandling.typeBehandling.søknadsbehandling');
    }
};

export const formatRestansStatus = (
    status: RestansStatus,
    formatMessage: (string: keyof typeof messages) => string
) => {
    switch (status) {
        case RestansStatus.NY_SØKNAD:
            return formatMessage('behandling.status.nySøknad');
        case RestansStatus.TIL_ATTESTERING:
            return formatMessage('behandling.status.tilAttestering');
        case RestansStatus.UNDERKJENT:
            return formatMessage('behandling.status.underkjent');
        case RestansStatus.UNDER_BEHANDLING:
            return formatMessage('behandling.status.underBehandling');
    }
};
