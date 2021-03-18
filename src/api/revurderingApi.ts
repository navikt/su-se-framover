import { formatISO } from 'date-fns';

import { Fradrag, Periode } from '~types/Fradrag';
import { Uføregrunnlag } from '~types/Grunnlag';
import {
    OpprettetRevurdering,
    SimulertRevurdering,
    RevurderingTilAttestering,
    IverksattRevurdering,
    LeggTilUføreResponse,
} from '~types/Revurdering';

import apiClient, { ApiClientResult } from './apiClient';

export async function opprettRevurdering(
    sakId: string,
    fraOgMed: Date
): Promise<ApiClientResult<OpprettetRevurdering>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/opprett`,
        method: 'POST',
        body: {
            fraOgMed: formatISO(fraOgMed, { representation: 'date' }),
        },
    });
}

export async function oppdaterRevurderingsPeriode(
    sakId: string,
    revurderingId: string,
    fraOgMed: Date
): Promise<ApiClientResult<OpprettetRevurdering>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/oppdaterPeriode`,
        method: 'POST',
        body: { fraOgMed: formatISO(fraOgMed, { representation: 'date' }) },
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
): Promise<ApiClientResult<RevurderingTilAttestering>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/tilAttestering`,
        method: 'POST',
    });
}

export async function iverksett(sakId: string, revurderingId: string): Promise<ApiClientResult<IverksattRevurdering>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/iverksett`,
        method: 'POST',
    });
}

export async function lagreUføregrunnlag(sakId: string, revurderingId: string, uføregrunnlag: Uføregrunnlag[]) {
    return apiClient<LeggTilUføreResponse>({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/uføregrunnlag`,
        method: 'POST',
        body: uføregrunnlag.map((uføregrunnlag) => ({
            ...uføregrunnlag,
            periode: {
                fraOgMed: uføregrunnlag.periode.fraOgMed,
                tilOgMed: uføregrunnlag.periode.tilOgMed,
            },
        })),
    });
}
