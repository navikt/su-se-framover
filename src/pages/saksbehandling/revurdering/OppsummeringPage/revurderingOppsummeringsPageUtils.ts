import { BeregnetIngenEndring, Revurdering, SimulertRevurdering, UnderkjentRevurdering } from '~src/types/Revurdering';
import {
    erForhåndsvarslingBesluttet,
    erGregulering,
    erIngenForhåndsvarsel,
    erRevurderingForhåndsvarslet,
    erRevurderingTilbakekrevingIkkeAvgjort,
    erRevurderingTilbakekrevingsbehandling,
    erRevurderingUnderkjent,
    skalAttesteres,
} from '~src/utils/revurdering/revurderingUtils';

export const hentBrevsending = (revurdering: SimulertRevurdering | BeregnetIngenEndring | UnderkjentRevurdering) => {
    if (
        erForhåndsvarslingBesluttet(revurdering) ||
        erIngenForhåndsvarsel(revurdering) ||
        erRevurderingUnderkjent(revurdering)
    ) {
        return 'alltidSende';
    } else if (erGregulering(revurdering.årsak)) {
        return 'aldriSende';
    } else {
        return 'kanVelge';
    }
};

export enum OppsummeringState {
    ATTESTERING = 'ATTESTERING',
    TILBAKEKREVING = 'TILBAKEKREVING',
    FORHÅNDSVARSLING = 'FORHÅNDSVARSLING',
    ER_FORHÅNDSVARSLET = 'ER_FORHÅNDSVARSLET',
}

export const getOppsummeringsformState = (revurdering: Revurdering): OppsummeringState => {
    const visTilbakekrevingForm =
        (erRevurderingTilbakekrevingsbehandling(revurdering) && erRevurderingTilbakekrevingIkkeAvgjort(revurdering)) ||
        (erRevurderingTilbakekrevingsbehandling(revurdering) !== null && revurdering.forhåndsvarsel === null);

    if (visTilbakekrevingForm) return OppsummeringState.TILBAKEKREVING;
    if (skalAttesteres(revurdering)) return OppsummeringState.ATTESTERING;
    if (!erRevurderingForhåndsvarslet(revurdering)) return OppsummeringState.FORHÅNDSVARSLING;
    return OppsummeringState.ER_FORHÅNDSVARSLET;
};

export const UNDERSCORE_REGEX = /^((?!_____)[\s\S])*$/;
