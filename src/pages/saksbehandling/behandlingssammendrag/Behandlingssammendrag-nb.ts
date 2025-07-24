import { BehandlingssammendragType, BehandlingssammendragStatus } from '~src/types/Behandlingssammendrag';
import { Sakstype } from '~src/types/Sak.ts';

export const behandlingssammendragTypeMessages: { [key in BehandlingssammendragType]: string } = {
    [BehandlingssammendragType.SØKNADSBEHANDLING]: 'Søknadsbehandling',
    [BehandlingssammendragType.REVURDERING]: 'Revurdering',
    [BehandlingssammendragType.KLAGE]: 'Klage',
    [BehandlingssammendragType.REGULERING]: 'Regulering',
    [BehandlingssammendragType.TILBAKEKREVING]: 'Tilbakekreving',
    [BehandlingssammendragType.KRAVGRUNNLAG]: 'Kravgrunnlag',
    [BehandlingssammendragType.OMGJØRING]: 'Omgjøring',
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
    [BehandlingssammendragStatus.ÅPEN]: 'Åpen',
    [BehandlingssammendragStatus.AVBRUTT]: 'Avbrutt',
    [BehandlingssammendragStatus.AVSLUTTET]: 'Avsluttet',
};

export const sakstypeText: { [key in Sakstype]: string } = {
    [Sakstype.Alder]: 'Alder',
    [Sakstype.Uføre]: 'Uføre',
};

export default {
    ...behandlingssammendragTypeMessages,
    ...behandlingssammendragStatus,
    ...sakstypeText,

    'behandlingssammendrag.ingenBehandlinger': 'Ingen behandlinger',
    'behandlingssammendrag.behandling.startet': 'Behandling startet',
    'behandlingssammendrag.typeBehandling': 'Behandlingstype',
    'behandlingssammendrag.status': 'Status',
    'behandlingssammendrag.periode': 'Periode',
    'sak.saksnummer': 'Saksnummer',
    'sak.saktype': 'Saktype',
    'sak.seSak': 'Se sak',
    'sak.åpneINyFane': 'Åpne sak i ny fane',
};
