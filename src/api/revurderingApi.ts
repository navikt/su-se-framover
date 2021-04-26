import { formatISO } from 'date-fns';

import { Nullable } from '~lib/types';
import { UnderkjennRevurderingGrunn } from '~pages/attestering/attesterRevurdering/AttesterRevurdering';
import { Fradrag } from '~types/Fradrag';
import { SimulertEndringGrunnlag } from '~types/Grunnlag';
import { Periode } from '~types/Periode';
import {
    OpprettetRevurdering,
    SimulertRevurdering,
    RevurderingTilAttestering,
    IverksattRevurdering,
    UnderkjentRevurdering,
    OpprettetRevurderingGrunn,
    LeggTilUføreResponse,
} from '~types/Revurdering';

import apiClient, { ApiClientResult } from './apiClient';

export async function opprettRevurdering(
    sakId: string,
    fraOgMed: Date,
    årsak: OpprettetRevurderingGrunn,
    begrunnelse: string
): Promise<ApiClientResult<OpprettetRevurdering>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger`,
        method: 'POST',
        body: {
            fraOgMed: formatISO(fraOgMed, { representation: 'date' }),
            årsak: årsak,
            begrunnelse: begrunnelse,
        },
    });
}

export async function oppdaterRevurdering(
    sakId: string,
    revurderingId: string,
    fraOgMed: Date,
    årsak: OpprettetRevurderingGrunn,
    begrunnelse: string
): Promise<ApiClientResult<OpprettetRevurdering>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}`,
        method: 'PUT',
        body: { fraOgMed: formatISO(fraOgMed, { representation: 'date' }), årsak: årsak, begrunnelse: begrunnelse },
    });
}

export async function beregnOgSimuler(
    sakId: string,
    arg: {
        revurderingId: string;
        periode: Periode<string>;
        fradrag: Fradrag[];
        forventetInntekt?: number;
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
            forventetInntekt: arg.forventetInntekt,
        },
    });
}

export async function sendTilAttestering(
    sakId: string,
    revurderingId: string,
    fritekstTilBrev: string,
    skalFøreTilBrevutsending?: boolean
): Promise<ApiClientResult<RevurderingTilAttestering>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/tilAttestering`,
        method: 'POST',
        body: {
            fritekstTilBrev,
            skalFøreTilBrevutsending: skalFøreTilBrevutsending,
        },
    });
}

export async function underkjenn(
    sakId: string,
    revurderingId: string,
    grunn: UnderkjennRevurderingGrunn,
    kommentar?: string
): Promise<ApiClientResult<UnderkjentRevurdering>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/underkjenn`,
        method: 'PATCH',
        body: {
            grunn: grunn,
            kommentar: kommentar,
        },
    });
}

export async function iverksett(sakId: string, revurderingId: string): Promise<ApiClientResult<IverksattRevurdering>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/iverksett`,
        method: 'POST',
    });
}

export async function lagreUføregrunnlag(arg: {
    sakId: string;
    revurderingId: string;
    periode: Periode<string>;
    uføregrad: Nullable<number>;
    forventetInntekt: Nullable<number>;
}) {
    return apiClient<LeggTilUføreResponse>({
        url: `/saker/${arg.sakId}/revurderinger/${arg.revurderingId}/uføregrunnlag`,
        method: 'POST',
        body: {
            uføregrad: arg.uføregrad,
            forventetInntekt: arg.forventetInntekt,
            periode: {
                fraOgMed: arg.periode.fraOgMed,
                tilOgMed: arg.periode.tilOgMed,
            },
        },
    });
}

export async function hentUføregrunnlag(
    sakId: string,
    revurderingId: string
): Promise<ApiClientResult<SimulertEndringGrunnlag>> {
    return apiClient<SimulertEndringGrunnlag>({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/uføregrunnlag`,
        method: 'GET',
    });
}
