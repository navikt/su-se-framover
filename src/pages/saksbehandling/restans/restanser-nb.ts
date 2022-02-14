import { RestansType, RestansStatus } from '~types/Restans';

export const restansTypeMessages: { [key in RestansType]: string } = {
    [RestansType.SØKNADSBEHANDLING]: 'Søknadsbehandling',
    [RestansType.REVURDERING]: 'Revurdering',
    [RestansType.KLAGE]: 'Klage',
};

export const restansStatus: { [key in RestansStatus]: string } = {
    [RestansStatus.INGEN_ENDRING]: 'Ingen endring',
    [RestansStatus.AVSLAG]: 'Avslått',
    [RestansStatus.AVSLUTTET]: 'Avsluttet / lukket',
    [RestansStatus.INNVILGET]: 'Innvilget',
    [RestansStatus.OPPHØR]: 'Opphørt',
    [RestansStatus.NY_SØKNAD]: 'Ny søknad',
    [RestansStatus.UNDER_BEHANDLING]: 'Under behandling',
    [RestansStatus.TIL_ATTESTERING]: 'Til attestering',
    [RestansStatus.UNDERKJENT]: 'Underkjent',
};

export default {
    'restans.ingenRestanser': 'Ingen restanser',
    'restans.behandling.startet': 'Behandling startet',

    'restans.typeBehandling': 'Type behandling',
    ...restansTypeMessages,

    'restans.status': 'Status',
    ...restansStatus,

    'åpne.behandlinger.overskrift': 'Åpne behandlinger',

    'sak.saksnummer': 'Saksnummer',
    'sak.seSak': 'Se sak',

    'feil.feilOppstod': 'En feil oppstod',
    'feil.sak.kunneIkkeHente': 'Kunne ikke hente sak',
};
