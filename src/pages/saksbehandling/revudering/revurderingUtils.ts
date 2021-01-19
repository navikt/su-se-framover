import { erIverksattInnvilget } from '~features/behandling/behandlingUtils';
import * as Routes from '~lib/routes';
import { Sak } from '~types/Sak';

import { RevurderingSteg } from '../types';

export const createRevurderingsPath = (sakId: string, steg: RevurderingSteg) => {
    return Routes.revurderValgtSak.createURL({ sakId: sakId, steg: steg });
};

export const getInnvilgedeBehandlinger = (sak: Sak) => {
    return sak.behandlinger.filter((b) => {
        return erIverksattInnvilget(b);
    });
};
