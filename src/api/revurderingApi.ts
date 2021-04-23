import { formatISO } from 'date-fns';

import { UnderkjennRevurderingGrunn } from '~pages/attestering/attesterRevurdering/AttesterRevurdering';
import { Fradrag, Periode } from '~types/Fradrag';
import {
    OpprettetRevurdering,
    SimulertRevurdering,
    RevurderingTilAttestering,
    IverksattRevurdering,
    UnderkjentRevurdering,
    OpprettetRevurderingGrunn,
    RevurderingErrorCodes,
    BeslutningEtterForhåndsvarsling,
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

export enum Revurderingshandling {
    SendTilAttestering = 'SEND_TIL_ATTESTERING',
    Forhåndsvarsle = 'FORHÅNDSVARSLE',
}

export async function forhåndsvarsleEllerSendTilAttestering(
    sakId: string,
    revurderingId: string,
    revurderingshandling: Revurderingshandling,
    fritekstTilBrev: string
): Promise<ApiClientResult<SimulertRevurdering, RevurderingErrorCodes>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/forhandsvarsleEllerSendTilAttestering`,
        method: 'POST',
        body: {
            revurderingshandling,
            fritekst: fritekstTilBrev,
        },
    });
}

export async function sendTilAttestering(
    sakId: string,
    revurderingId: string,
    fritekstTilBrev: string,
    skalFøreTilBrevutsending?: boolean
): Promise<ApiClientResult<RevurderingTilAttestering, RevurderingErrorCodes>> {
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

export async function fortsettEtterForhåndsvarsel(
    sakId: string,
    revurderingId: string,
    begrunnelse: string,
    valg: BeslutningEtterForhåndsvarsling,
    fritekstTilBrev: string
): Promise<ApiClientResult<SimulertRevurdering | RevurderingTilAttestering>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/fortsettEtterForhåndsvarsel`,
        method: 'POST',
        body: {
            begrunnelse,
            valg,
            fritekstTilBrev,
        },
    });
}
