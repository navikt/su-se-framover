import { Nullable } from '~lib/types';

import { Behandling, Attestering } from './Behandling';
import { Beregning } from './Beregning';
import { Periode } from './Fradrag';

export interface Revurdering<T extends RevurderingsStatus = RevurderingsStatus> {
    id: string;
    status: T;
    opprettet: string;
    periode: Periode<string>;
    tilRevurdering: Behandling;
    saksbehandler: string;
    attestering: Nullable<Attestering>;
    årsak: OpprettetRevurderingGrunn;
    begrunnelse: Nullable<string>;
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
    attestering: Attestering;
}

export interface UnderkjentRevurdering extends Revurdering<RevurderingsStatus.UNDERKJENT> {
    beregninger: Beregninger;
    attestering: Attestering;
}

export enum RevurderingsStatus {
    OPPRETTET = 'OPPRETTET',
    BEREGNET_INNVILGET = 'BEREGNET_INNVILGET',
    BEREGNET_AVSLAG = 'BEREGNET_AVSLAG',
    SIMULERT = 'SIMULERT',
    TIL_ATTESTERING = 'TIL_ATTESTERING',
    IVERKSATT = 'IVERKSATT',
    UNDERKJENT = 'UNDERKJENT',
}

export enum OpprettetRevurderingGrunn {
    MELDING_FRA_BRUKER = 'MELDING_FRA_BRUKER',
    INFORMASJON_FRA_KONTROLLSAMTALE = 'INFORMASJON_FRA_KONTROLLSAMTALE',
    DØDSFALL = 'DØDSFALL',
    ANDRE_KILDER = 'ANDRE_KILDER',
    MIGRERT = 'MIGRERT',
}
