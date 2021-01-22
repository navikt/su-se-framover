import { formatISO } from 'date-fns';

import { Beregning } from '~types/Beregning';
import { Fradrag } from '~types/Fradrag';
import { OpprettetRevurdering, TilAttesteringRevurdering } from '~types/Revurdering';

import apiClient, { ApiClientResult } from './apiClient';

export async function opprettRevurdering(
    sakId: string,
    periode: {
        fom: Date;
        tom: Date;
    }
): Promise<ApiClientResult<OpprettetRevurdering>> {
    return apiClient({
        url: `/saker/${sakId}/revurdering/opprett`,
        method: 'POST',
        body: {
            fraOgMed: formatISO(periode.fom, { representation: 'date' }),
            tilOgMed: formatISO(periode.tom, { representation: 'date' }),
        },
    });
}

export async function beregnOgSimuler(
    sakId: string,
    arg: {
        revurderdingId: string;
        fom: Date;
        tom: Date;
        fradrag: Fradrag[];
    }
): Promise<ApiClientResult<{ beregning: Beregning; revurdert: Beregning }>> {
    const { fom, tom } = arg;
    return apiClient({
        url: `/saker/${sakId}/revurdering/beregnOgSimuler`,
        method: 'POST',
        body: {
            revurderingId: arg.revurderdingId,
            fraOgMed: formatISO(fom, { representation: 'date' }),
            tilOgMed: formatISO(tom, { representation: 'date' }),
            fradrag: arg.fradrag,
        },
    });
}

export async function sendTilAttestering(
    sakId: string,
    revurderingId: string
): Promise<ApiClientResult<TilAttesteringRevurdering>> {
    return apiClient({
        url: `/saker/${sakId}/revurdering/${revurderingId}/tilAttestering`,
        method: 'POST',
    });
}
