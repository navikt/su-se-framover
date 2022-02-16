import { RestansType, RestansStatus } from '~types/Restans';

export const restansTypeMessages: { [key in RestansType]: string } = {
    [RestansType.SØKNADSBEHANDLING]: 'Søknadsbehandling',
    [RestansType.REVURDERING]: 'Revurdering',
    [RestansType.KLAGE]: 'Klage',
};

export const restansStatus: { [key in RestansStatus]: string } = {
    [RestansStatus.INGEN_ENDRING]: 'Ingen endring',
    [RestansStatus.AVSLAG]: 'Avslått',
    [RestansStatus.INNVILGET]: 'Innvilget',
    [RestansStatus.OPPHØR]: 'Opphørt',
    [RestansStatus.NY_SØKNAD]: 'Ny søknad',
    [RestansStatus.UNDER_BEHANDLING]: 'Under behandling',
    [RestansStatus.TIL_ATTESTERING]: 'Til attestering',
    [RestansStatus.UNDERKJENT]: 'Underkjent',
    [RestansStatus.STANS]: 'Stans',
    [RestansStatus.GJENOPPTAK]: 'Gjenopptatt',
    [RestansStatus.OVERSENDT]: 'Oversendt',
};

export default {
    ...restansTypeMessages,
    ...restansStatus,

    'restans.ingenBehandlinger': 'Ingen behandlinger',
    'restans.behandling.startet': 'Behandling startet',
    'restans.typeBehandling': 'Behandlingstype',
    'restans.status': 'Status',
    'sak.saksnummer': 'Saksnummer',
    'sak.seSak': 'Se sak',
};
