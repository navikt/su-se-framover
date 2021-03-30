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
    fritekstTilBrev: string;
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

export interface SimulertRevurdering
    extends Revurdering<RevurderingsStatus.SIMULERT_INNVILGET | RevurderingsStatus.SIMULERT_OPPHØRT> {
    beregninger: Beregninger;
}

export interface RevurderingTilAttestering
    extends Revurdering<RevurderingsStatus.TIL_ATTESTERING_INNVILGET | RevurderingsStatus.TIL_ATTESTERING_OPPHØRT> {
    beregninger: Beregninger;
}

export interface IverksattRevurdering
    extends Revurdering<RevurderingsStatus.IVERKSATT_INNVILGET | RevurderingsStatus.IVERKSATT_OPPHØRT> {
    beregninger: Beregninger;
    attestering: Attestering;
}

export interface UnderkjentRevurdering
    extends Revurdering<RevurderingsStatus.UNDERKJENT_INNVILGET | RevurderingsStatus.UNDERKJENT_OPPHØRT> {
    beregninger: Beregninger;
    attestering: Attestering;
}

export enum RevurderingsStatus {
    OPPRETTET = 'OPPRETTET',
    BEREGNET_INNVILGET = 'BEREGNET_INNVILGET',
    BEREGNET_AVSLAG = 'BEREGNET_AVSLAG',
    SIMULERT_OPPHØRT = 'SIMULERT_OPPHØRT',
    SIMULERT_INNVILGET = 'SIMULERT_INNVILGET',
    TIL_ATTESTERING_INNVILGET = 'TIL_ATTESTERING_INNVILGET',
    TIL_ATTESTERING_OPPHØRT = 'TIL_ATTESTERING_OPPHØRT',
    IVERKSATT_INNVILGET = 'IVERKSATT_INNVILGET',
    IVERKSATT_OPPHØRT = 'IVERKSATT_OPPHØRT',
    UNDERKJENT_INNVILGET = 'UNDERKJENT_INNVILGET',
    UNDERKJENT_OPPHØRT = 'UNDERKJENT_OPPHØRT',
}

export enum OpprettetRevurderingGrunn {
    MELDING_FRA_BRUKER = 'MELDING_FRA_BRUKER',
    INFORMASJON_FRA_KONTROLLSAMTALE = 'INFORMASJON_FRA_KONTROLLSAMTALE',
    DØDSFALL = 'DØDSFALL',
    ANDRE_KILDER = 'ANDRE_KILDER',
    MIGRERT = 'MIGRERT',
}
