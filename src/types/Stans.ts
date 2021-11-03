import { RevurderingsStatus, AbstraktRevurdering } from './Revurdering';
import { Simulering } from './Simulering';

export interface StansAvYtelse
    extends AbstraktRevurdering<RevurderingsStatus.SIMULERT_STANS | RevurderingsStatus.IVERKSATT_STANS> {
    simulering: Simulering;
}

export interface Gjenopptak
    extends AbstraktRevurdering<RevurderingsStatus.SIMULERT_GJENOPPTAK | RevurderingsStatus.IVERKSATT_GJENOPPTAK> {
    simulering: Simulering;
}
