import { Revurdering, SimulertRevurdering } from '~types/Revurdering';

export const erRevurderingSimulert = (revurdering: Revurdering): revurdering is SimulertRevurdering =>
    'beregninger' in revurdering;
