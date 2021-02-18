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
interface Beregninger {
    beregning: Beregning;
    revurdert: Beregning;
}

export type OpprettetRevurdering = Revurdering;

export interface BeregnetInnvilget extends Revurdering {
    status: RevurderingsStatus.BEREGNET_INNVILGET;
    beregninger: Beregninger;
}

export interface BeregnetAvslag extends Revurdering {
    status: RevurderingsStatus.BEREGNET_AVSLAG;
    beregninger: Beregninger;
}

export interface SimulertRevurdering extends Revurdering {
    status: RevurderingsStatus.SIMULERT;
    beregninger: Beregninger;
}

export interface RevurderingTilAttestering extends Revurdering {
    status: RevurderingsStatus.TIL_ATTESTERING;
    beregninger: Beregninger;
}

export interface IverksattRevurdering extends Revurdering {
    status: RevurderingsStatus.IVERKSATT;
    beregninger: Beregninger;
    attestant: string;
}

export enum RevurderingsStatus {
    OPPRETTET = 'OPPRETTET',
    BEREGNET_INNVILGET = 'BEREGNET_INNVILGET',
    BEREGNET_AVSLAG = 'BEREGNET_AVSLAG',
    SIMULERT = 'SIMULERT',
    TIL_ATTESTERING = 'TIL_ATTESTERING',
    IVERKSATT = 'IVERKSATT',
}
