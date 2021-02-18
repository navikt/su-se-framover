import { Revurdering, SimulertRevurdering, RevurderingsStatus, OpprettetRevurdering } from '~types/Revurdering';

export const erRevurderingOpprettet = (r: Revurdering): r is OpprettetRevurdering => !('beregninger' in r);

export const erRevurderingSimulert = (revurdering: Revurdering): revurdering is SimulertRevurdering =>
    'beregninger' in revurdering;

export const erRevurderingBeregnetAvslag = (r: Revurdering): r is SimulertRevurdering =>
    r.status === RevurderingsStatus.BEREGNET_AVSLAG;

export const erRevurderingTilAttestering = (r: Revurdering): r is SimulertRevurdering =>
    r.status === RevurderingsStatus.TIL_ATTESTERING;

export const erRevurderingIverksatt = (r: Revurdering) => {
    return r.status === RevurderingsStatus.IVERKSATT;
};
