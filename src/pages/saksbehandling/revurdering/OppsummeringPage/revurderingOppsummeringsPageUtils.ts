import { BeregnetIngenEndring, Revurdering, SimulertRevurdering, UnderkjentRevurdering } from '~src/types/Revurdering';
import {
    erBeregnetIngenEndring,
    erGregulering,
    erRevurderingTilbakekrevingIkkeAvgjort,
    erRevurderingTilbakekrevingsbehandling,
} from '~src/utils/revurdering/revurderingUtils';

export const hentBrevsending = (revurdering: SimulertRevurdering | BeregnetIngenEndring | UnderkjentRevurdering) => {
    if (erGregulering(revurdering.årsak)) {
        return 'aldriSende';
    } else if (erBeregnetIngenEndring(revurdering)) {
        return 'kanVelge';
    } else {
        return 'alltidSende';
    }
};

export enum OppsummeringState {
    ATTESTERING = 'ATTESTERING',
    TILBAKEKREVING = 'TILBAKEKREVING',
}

export const getOppsummeringsformState = (revurdering: Revurdering): OppsummeringState => {
    const visTilbakekrevingForm =
        (erRevurderingTilbakekrevingsbehandling(revurdering) && erRevurderingTilbakekrevingIkkeAvgjort(revurdering)) ||
        (erRevurderingTilbakekrevingsbehandling(revurdering) && revurdering.tilbakekrevingsbehandling !== null);

    if (visTilbakekrevingForm) return OppsummeringState.TILBAKEKREVING;
    return OppsummeringState.ATTESTERING;
};

export const UNDERSCORE_REGEX = /^((?!_____)[\s\S])*$/;
