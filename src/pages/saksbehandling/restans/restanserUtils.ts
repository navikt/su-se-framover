import { RestansStatus, RestansType } from '~types/Restans';

import messages from './restanser-nb';

export const formatRestansType = (type: RestansType, formatMessage: (string: keyof typeof messages) => string) => {
    switch (type) {
        case RestansType.REVURDERING:
            return formatMessage('restans.typeBehandling.revurdering');
        case RestansType.SØKNADSBEHANDLING:
            return formatMessage('restans.typeBehandling.søknadsbehandling');
    }
};

export const formatRestansStatus = (
    status: RestansStatus,
    formatMessage: (string: keyof typeof messages) => string
) => {
    switch (status) {
        case RestansStatus.NY_SØKNAD:
            return formatMessage('restans.status.nySøknad');
        case RestansStatus.TIL_ATTESTERING:
            return formatMessage('restans.status.tilAttestering');
        case RestansStatus.UNDERKJENT:
            return formatMessage('restans.status.underkjent');
        case RestansStatus.UNDER_BEHANDLING:
            return formatMessage('restans.status.underBehandling');
    }
};
