import { Behandling } from './Behandling';
import { Beregning } from './Beregning';
import { Periode } from './Fradrag';

export interface Revurdering {
    id: string;
    status: RevurderingsStatus;
    opprettet: string;
    periode: Periode<string>;
    tilRevurdering: Behandling;
    saksbehandler: string;
}
export type OpprettetRevurdering = Revurdering;

export interface SimulertRevurdering extends Revurdering {
    beregninger: {
        beregning: Beregning;
        revurdert: Beregning;
    };
    saksbehandler: string;
}

export interface RevurderingTilAttestering extends SimulertRevurdering {
    beregninger: {
        beregning: Beregning;
        revurdert: Beregning;
    };
    saksbehandler: string;
}

export interface IverksattRevurdering extends RevurderingTilAttestering {
    attestant: string;
}

export enum RevurderingsStatus {
    OPPRETTET = 'OPPRETTET',
    BEREGNET = 'BEREGNET',
    SIMULERT = 'SIMULERT',
    TIL_ATTESTERING = 'TIL_ATTESTERING',
    IVERKSATT = 'IVERKSATT',
}
