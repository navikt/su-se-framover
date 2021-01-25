import { formatISO } from 'date-fns';

import { Beregning } from '~types/Beregning';
import { Fradrag, Periode } from '~types/Fradrag';
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
        revurderingId: string;
        periode: Periode;
        fradrag: Fradrag[];
    }
): Promise<ApiClientResult<{ beregning: Beregning; revurdert: Beregning }>> {
    return apiClient({
        url: `/saker/${sakId}/revurdering/beregnOgSimuler`,
        method: 'POST',
        body: {
            revurderingId: arg.revurderingId,
            periode: {
                fraOgMed: formatISO(new Date(arg.periode.fraOgMed), { representation: 'date' }),
                tilOgMed: formatISO(new Date(arg.periode.tilOgMed), { representation: 'date' }),
            },
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
