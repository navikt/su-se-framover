import { Behandling } from './Behandling';
import { Beregning } from './Beregning';
import { Periode } from './Fradrag';
import { Grunnlag, SimulertEndringGrunnlag } from './Grunnlag';

export interface Revurdering<T extends RevurderingsStatus = RevurderingsStatus> {
    id: string;
    status: T;
    opprettet: string;
    periode: Periode<string>;
    tilRevurdering: Behandling;
    saksbehandler: string;
    grunnlag: Grunnlag;
    simulertEndringGrunnlag?: SimulertEndringGrunnlag;
}

interface Beregninger {
    beregning: Beregning;
    revurdert: Beregning;
}

export type OpprettetRevurdering = Revurdering<RevurderingsStatus.OPPRETTET>;

export interface BeregnetInnvilget extends Revurdering<RevurderingsStatus.BEREGNET_INNVILGET> {
    beregninger: Beregninger;
}

export interface BeregnetAvslag extends Revurdering<RevurderingsStatus.BEREGNET_AVSLAG> {
    beregninger: Beregninger;
}

export interface SimulertRevurdering extends Revurdering<RevurderingsStatus.SIMULERT> {
    beregninger: Beregninger;
}

export interface RevurderingTilAttestering extends Revurdering<RevurderingsStatus.TIL_ATTESTERING> {
    beregninger: Beregninger;
}

export interface IverksattRevurdering extends Revurdering<RevurderingsStatus.IVERKSATT> {
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

export interface LeggTilUføreResponse {
    revurdering: Revurdering;
    simulertEndringGrunnlag: SimulertEndringGrunnlag;
}
