import { BeregnetIngenEndring, Revurdering, SimulertRevurdering, UnderkjentRevurdering } from '~types/Revurdering';
import {
    erForhåndsvarslingBesluttet,
    erGregulering,
    erIngenForhåndsvarsel,
    erRevurderingForhåndsvarslet,
    erRevurderingUnderkjent,
    skalAttesteres,
} from '~utils/revurdering/revurderingUtils';

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
    ATTESTERING,
    TILBAKEKREVING,
    FORHÅNDSVARSLING,
    ER_FORHÅNDSVARSLET,
}

export const getOppsummeringsformState = (revurdering: Revurdering): OppsummeringState => {
    const visTilbakekrevingForm = revurdering.tilbakekrevingsbehandling !== null && revurdering.forhåndsvarsel === null;

    if (skalAttesteres(revurdering)) return OppsummeringState.ATTESTERING;
    if (visTilbakekrevingForm) return OppsummeringState.TILBAKEKREVING;
    if (!erRevurderingForhåndsvarslet(revurdering)) return OppsummeringState.FORHÅNDSVARSLING;
    return OppsummeringState.ER_FORHÅNDSVARSLET;
};
