import { BehandlingssammendragType, BehandlingssammendragStatus } from '~src/types/Behandlingssammendrag';

export const behandlingssammendragTypeMessages: { [key in BehandlingssammendragType]: string } = {
    [BehandlingssammendragType.SØKNADSBEHANDLING]: 'Søknadsbehandling',
    [BehandlingssammendragType.REVURDERING]: 'Revurdering',
    [BehandlingssammendragType.KLAGE]: 'Klage',
    [BehandlingssammendragType.REGULERING]: 'Regulering',
    [BehandlingssammendragType.TILBAKEKREVING]: 'Tilbakekreving',
};

export const behandlingssammendragStatus: { [key in BehandlingssammendragStatus]: string } = {
    [BehandlingssammendragStatus.AVSLAG]: 'Avslått',
    [BehandlingssammendragStatus.INNVILGET]: 'Innvilget',
    [BehandlingssammendragStatus.OPPHØR]: 'Opphørt',
    [BehandlingssammendragStatus.NY_SØKNAD]: 'Ny søknad',
    [BehandlingssammendragStatus.UNDER_BEHANDLING]: 'Under behandling',
    [BehandlingssammendragStatus.TIL_ATTESTERING]: 'Til attestering',
    [BehandlingssammendragStatus.UNDERKJENT]: 'Underkjent',
    [BehandlingssammendragStatus.STANS]: 'Stanset',
    [BehandlingssammendragStatus.GJENOPPTAK]: 'Gjenopptatt',
    [BehandlingssammendragStatus.OVERSENDT]: 'Oversendt',
    [BehandlingssammendragStatus.IVERKSATT]: 'Iverksatt',
};

export default {
    ...behandlingssammendragTypeMessages,
    ...behandlingssammendragStatus,

    'behandlingssammendrag.ingenBehandlinger': 'Ingen behandlinger',
    'behandlingssammendrag.behandling.startet': 'Behandling startet',
    'behandlingssammendrag.typeBehandling': 'Behandlingstype',
    'behandlingssammendrag.status': 'Status',
    'behandlingssammendrag.periode': 'Periode',
    'sak.saksnummer': 'Saksnummer',
    'sak.seSak': 'Se sak',
};
