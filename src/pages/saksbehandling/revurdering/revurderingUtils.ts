import {
    Revurdering,
    SimulertRevurdering,
    RevurderingsStatus,
    OpprettetRevurdering,
    RevurderingTilAttestering,
    IverksattRevurdering,
    BeregnetAvslag,
    UnderkjentRevurdering,
} from '~types/Revurdering';

export const erRevurderingOpprettet = (r: Revurdering): r is OpprettetRevurdering => !('beregninger' in r);

export const erRevurderingSimulert = (revurdering: Revurdering): revurdering is SimulertRevurdering =>
    'beregninger' in revurdering;

export const erRevurderingBeregnetAvslag = (r: Revurdering): r is BeregnetAvslag =>
    r.status === RevurderingsStatus.BEREGNET_AVSLAG;

export const erRevurderingTilAttestering = (r: Revurdering): r is RevurderingTilAttestering =>
    r.status === RevurderingsStatus.TIL_ATTESTERING;

export const erRevurderingIverksatt = (r: Revurdering): r is IverksattRevurdering =>
    r.status === RevurderingsStatus.IVERKSATT;

export const erRevurderingUnderkjent = (r: Revurdering): r is UnderkjentRevurdering =>
    r.status === RevurderingsStatus.UNDERKJENT;
