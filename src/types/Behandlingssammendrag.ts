import { Nullable } from '~src/lib/types';
import { Sakstype } from '~src/types/Sak.ts';

import { Periode } from './Periode';

export interface Behandlingssammendrag {
    sakType: Sakstype;
    saksnummer: string;
    typeBehandling: BehandlingssammendragType;
    status: BehandlingssammendragStatus;
    periode: Nullable<Periode<string>>;
    behandlingStartet: Nullable<string>;
}

export enum BehandlingssammendragType {
    SØKNADSBEHANDLING = 'SØKNADSBEHANDLING',
    REVURDERING = 'REVURDERING',
    KLAGE = 'KLAGE',
    REGULERING = 'REGULERING',
    TILBAKEKREVING = 'TILBAKEKREVING',
    KRAVGRUNNLAG = 'KRAVGRUNNLAG',
    OMGJØRING = 'OMGJØRING',
}

export enum BehandlingssammendragStatus {
    NY_SØKNAD = 'NY_SØKNAD',
    UNDER_BEHANDLING = 'UNDER_BEHANDLING',
    TIL_ATTESTERING = 'TIL_ATTESTERING',
    UNDERKJENT = 'UNDERKJENT',
    INNVILGET = 'INNVILGET',
    OPPHØR = 'OPPHØR',
    AVSLAG = 'AVSLAG',
    STANS = 'STANS',
    GJENOPPTAK = 'GJENOPPTAK',
    OVERSENDT = 'OVERSENDT',
    IVERKSATT = 'IVERKSATT',
    ÅPEN = 'ÅPEN',
    AVSLUTTET = 'AVSLUTTET',
    AVBRUTT = 'AVBRUTT',
}
