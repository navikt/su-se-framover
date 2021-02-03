import { formatISO } from 'date-fns';

import { Fradrag, Periode } from '~types/Fradrag';
import { OpprettetRevurdering, SimulertRevurdering, TilAttesteringRevurdering } from '~types/Revurdering';

import apiClient, { ApiClientResult } from './apiClient';

export async function opprettRevurdering(
    sakId: string,
    periode: Periode
): Promise<ApiClientResult<OpprettetRevurdering>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/opprett`,
        method: 'POST',
        body: {
            fraOgMed: formatISO(periode.fraOgMed, { representation: 'date' }),
            tilOgMed: formatISO(periode.tilOgMed, { representation: 'date' }),
        },
    });
}

export async function beregnOgSimuler(
    sakId: string,
    arg: {
        revurderingId: string;
        periode: Periode<string>;
        fradrag: Fradrag[];
    }
): Promise<ApiClientResult<SimulertRevurdering>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${arg.revurderingId}/beregnOgSimuler`,
        method: 'POST',
        body: {
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
        url: `/saker/${sakId}/revurderinger/${revurderingId}/tilAttestering`,
        method: 'POST',
    });
}
