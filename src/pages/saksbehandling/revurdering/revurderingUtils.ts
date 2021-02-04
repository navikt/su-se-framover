import { Revurdering, SimulertRevurdering, RevurderingsStatus, OpprettetRevurdering } from '~types/Revurdering';

export const erRevurderingOpprettet = (r: Revurdering): r is OpprettetRevurdering => !('beregninger' in r);

export const erRevurderingSimulert = (revurdering: Revurdering): revurdering is SimulertRevurdering =>
    'beregninger' in revurdering;

export const erRevurderingTilAttestering = (r: Revurdering): r is SimulertRevurdering =>
    r.status === RevurderingsStatus.TIL_ATTESTERING;

//TODO: implementer iverksetting backend
export const erRevurderingIverksatt = (r: Revurdering) => {
    console.log(r);
    return false;
};
