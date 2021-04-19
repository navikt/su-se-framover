import {
    Revurdering,
    SimulertRevurdering,
    RevurderingsStatus,
    OpprettetRevurdering,
    RevurderingTilAttestering,
    IverksattRevurdering,
    BeregnetIngenEndring,
    UnderkjentRevurdering,
} from '~types/Revurdering';

export const erRevurderingOpprettet = (r: Revurdering): r is OpprettetRevurdering =>
    r.status === RevurderingsStatus.OPPRETTET;

export const erRevurderingSimulert = (r: Revurdering): r is SimulertRevurdering =>
    r.status === RevurderingsStatus.SIMULERT_INNVILGET || r.status === RevurderingsStatus.SIMULERT_OPPHØRT;

export const erRevurderingForhåndsvarslet = (r: Revurdering) => r.harForhåndsvarslet === true;

export const erRevurderingIngenEndring = (r: Revurdering): r is BeregnetIngenEndring =>
    r.status === RevurderingsStatus.BEREGNET_INGEN_ENDRING ||
    r.status === RevurderingsStatus.UNDERKJENT_INGEN_ENDRING ||
    r.status === RevurderingsStatus.IVERKSATT_INGEN_ENDRING ||
    r.status === RevurderingsStatus.TIL_ATTESTERING_INGEN_ENDRING;

export const erRevurderingTilAttestering = (r: Revurdering): r is RevurderingTilAttestering =>
    r.status === RevurderingsStatus.TIL_ATTESTERING_INNVILGET ||
    r.status === RevurderingsStatus.TIL_ATTESTERING_OPPHØRT ||
    r.status === RevurderingsStatus.TIL_ATTESTERING_INGEN_ENDRING;

export const erRevurderingIverksatt = (r: Revurdering): r is IverksattRevurdering =>
    r.status === RevurderingsStatus.IVERKSATT_INNVILGET ||
    r.status === RevurderingsStatus.IVERKSATT_OPPHØRT ||
    r.status === RevurderingsStatus.IVERKSATT_INGEN_ENDRING;

export const erRevurderingUnderkjent = (r: Revurdering): r is UnderkjentRevurdering =>
    r.status === RevurderingsStatus.UNDERKJENT_INNVILGET ||
    r.status === RevurderingsStatus.UNDERKJENT_OPPHØRT ||
    r.status === RevurderingsStatus.UNDERKJENT_INGEN_ENDRING;
