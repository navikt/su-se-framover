import { Behandling } from './Behandling';
import { Beregning } from './Beregning';

export interface Revurdering {
    id: string;
    status: RevurderingsStatus;
    opprettet: string;
    tilRevurdering: Behandling;
}
export type OpprettetRevurdering = Revurdering & Record<string, never>;

export interface TilAttesteringRevurdering extends Revurdering {
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
