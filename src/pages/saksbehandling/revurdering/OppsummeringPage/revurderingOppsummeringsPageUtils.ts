import { Revurdering } from '~src/types/Revurdering';
import {
    erRevurderingTilbakekrevingIkkeAvgjort,
    erRevurderingTilbakekrevingsbehandling,
} from '~src/utils/revurdering/revurderingUtils';

export enum OppsummeringState {
    ATTESTERING = 'ATTESTERING',
    TILBAKEKREVING = 'TILBAKEKREVING',
}

export const getOppsummeringsformState = (revurdering: Revurdering): OppsummeringState => {
    const visTilbakekrevingForm =
        erRevurderingTilbakekrevingsbehandling(revurdering) && erRevurderingTilbakekrevingIkkeAvgjort(revurdering);
    if (visTilbakekrevingForm) return OppsummeringState.TILBAKEKREVING;
    return OppsummeringState.ATTESTERING;
};

export const UNDERSCORE_REGEX = /^((?!_____)[\s\S])*$/;
