import { RevurderingsStatus, Revurdering } from './Revurdering';
import { Simulering } from './Simulering';

export interface StansAvYtelse
    extends Revurdering<RevurderingsStatus.SIMULERT_STANS | RevurderingsStatus.IVERKSATT_STANS> {
    simulering: Simulering;
}

// export interface StansAvYtelse<T extends RevurderingsStatus = RevurderingsStatus> extends Revurdering<T> {
//     årsak: StansGrunn;
// }

// export type StansAvYtelsez<T extends RevurderingsStatus = RevurderingsStatus> = Revurdering<T> & {
//     årsak: StansGrunn;
// };

// export interface SimulertStansAvYtelse extends StansAvYtelse<RevurderingsStatus.SIMULERT_STANS> {
//     simulering: Simulering;
// }
// export interface IverksattStansAvYtelse extends StansAvYtelse<RevurderingsStatus.IVERKSATT_STANS> {
//     simulering: Simulering;
// }

// export function erStans(r: Revurdering): r is StansAvYtelse {
//     return 'årsak' in r;
// }
