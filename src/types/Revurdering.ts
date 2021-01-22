import { Behandling } from './Behandling';
import { Beregning } from './Beregning';

export interface OpprettetRevurdering {
    id: string;
    status: RevurderingsStatus;
    opprettet: string;
    tilRevurdering: Behandling;
}

export interface TilAttesteringRevurdering {
    id: string;
    status: RevurderingsStatus;
    opprettet: string;
    tilRevurdering: Behandling;
    beregninger: {
        beregning: Beregning;
        revurdert: Beregning;
    };
    saksbehandler: string;
}

export enum RevurderingsStatus {
    OPPRETTET = 'OPPRETTET',
    BEREGNET = 'BEREGNET',
    SIMULERT = 'SIMULERT',
    TIL_ATTESTERING = 'TIL_ATTESTERING',
}
