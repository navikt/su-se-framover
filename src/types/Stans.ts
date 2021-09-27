import { RevurderingsStatus, Revurdering } from './Revurdering';
import { Simulering } from './Simulering';

export interface StansAvYtelse
    extends Revurdering<RevurderingsStatus.SIMULERT_STANS | RevurderingsStatus.IVERKSATT_STANS> {
    simulering: Simulering;
}

export interface Gjenopptak
    extends Revurdering<RevurderingsStatus.SIMULERT_GJENOPPTAK | RevurderingsStatus.IVERKSATT_GJENOPPTAK> {
    simulering: Simulering;
}
