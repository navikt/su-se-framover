import * as Routes from '~lib/routes';
import { Revurdering, SimulertRevurdering } from '~types/Revurdering';

import { RevurderingSteg } from '../types';

export const createRevurderingsPath = (sakId: string, steg: RevurderingSteg) => {
    return Routes.revurderValgtSak.createURL({ sakId: sakId, steg: steg });
};

export const erRevurderingSimulert = (revurdering: Revurdering): revurdering is SimulertRevurdering =>
    'beregninger' in revurdering;
