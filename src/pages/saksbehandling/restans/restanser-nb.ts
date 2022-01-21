import { RestansType, RestansStatus } from '~types/Restans';

const restansTypeMessages: { [key in RestansType]: string } = {
    [RestansType.SØKNADSBEHANDLING]: 'Søknadsbehandling',
    [RestansType.REVURDERING]: 'Revurdering',
    [RestansType.KLAGE]: 'Klage',
};

const restansStatus: { [key in RestansStatus]: string } = {
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
