import {
    HarHistoriskAlderssakResponse,
    HistoriskAlderssakRequest,
    HistoriskeAldersmånedsbeløpRequest,
    HistoriskMånedsbeløpsperiode,
    HistoriskVedtaksperiode,
} from '~src/types/HistoriskAlderssak';
import {
    BeregnHistoriskInfotrygdRevurderingRequest,
    BeregnHistoriskInfotrygdRevurderingResponse,
    HistoriskInfotrygdAvsluttRequest,
    HistoriskInfotrygdMånedsgrunnlag,
    HistoriskInfotrygdRevurdering,
    HistoriskInfotrygdRevurderingRequest,
    OppdaterHistoriskInfotrygdVedtaksbrevRequest,
} from '~src/types/HistoriskInfotrygdRevurdering';

import apiClient, { ApiClientResult } from './apiClient';

export async function sjekkOmHistoriskAlderssakFinnes(
    request: HistoriskAlderssakRequest,
): Promise<ApiClientResult<HarHistoriskAlderssakResponse>> {
    return apiClient({
        url: '/historisk/alderssak/finnes',
        method: 'POST',
        body: { fnr: request.fnr },
    });
}

export async function hentHistoriskeVedtaksperioder(
    request: HistoriskAlderssakRequest,
): Promise<ApiClientResult<HistoriskVedtaksperiode[]>> {
    return apiClient({
        url: '/historisk/alderssak/vedtaksperioder',
        method: 'POST',
        body: { fnr: request.fnr },
    });
}

export async function hentHistoriskeMånedsbeløp(
    request: HistoriskeAldersmånedsbeløpRequest,
): Promise<ApiClientResult<HistoriskMånedsbeløpsperiode[]>> {
    return apiClient({
        url: '/historisk/alderssak/manedsbelop',
        method: 'POST',
        body: { vedtakId: request.vedtakId },
    });
}

export async function opprettHistoriskInfotrygdRevurdering(
    request: HistoriskInfotrygdRevurderingRequest,
): Promise<ApiClientResult<HistoriskInfotrygdRevurdering>> {
    return apiClient({
        url: '/historisk/alderssak/revurderinger',
        method: 'POST',
        body: {
            fnr: request.fnr,
            periode: {
                fraOgMed: request.periode.fraOgMed,
                tilOgMed: request.periode.tilOgMed,
            },
        },
    });
}

export async function hentHistoriskInfotrygdRevurdering(
    revurderingId: string,
): Promise<ApiClientResult<HistoriskInfotrygdRevurdering>> {
    return apiClient({
        url: `/historisk/alderssak/revurderinger/${revurderingId}`,
        method: 'GET',
    });
}

export async function avsluttHistoriskInfotrygdRevurdering(args: {
    revurderingId: string;
    body: HistoriskInfotrygdAvsluttRequest;
}): Promise<ApiClientResult<HistoriskInfotrygdRevurdering>> {
    return apiClient({
        url: `/historisk/alderssak/revurderinger/${args.revurderingId}/avslutt`,
        method: 'POST',
        body: {
            begrunnelse: args.body.begrunnelse,
        },
    });
}

export async function hentHistoriskeInfotrygdRevurderinger(
    request: HistoriskAlderssakRequest,
): Promise<ApiClientResult<HistoriskInfotrygdRevurdering[]>> {
    return apiClient({
        url: '/historisk/alderssak/revurderinger/oversikt',
        method: 'POST',
        body: { fnr: request.fnr },
    });
}

export async function hentHistoriskInfotrygdMånedsgrunnlag(
    revurderingId: string,
): Promise<ApiClientResult<HistoriskInfotrygdMånedsgrunnlag>> {
    return apiClient({
        url: `/historisk/alderssak/revurderinger/${revurderingId}/maanedsgrunnlag`,
        method: 'GET',
    });
}

export async function bekreftHistoriskForsørgingstillegg(
    revurderingId: string,
): Promise<ApiClientResult<HistoriskInfotrygdRevurdering>> {
    return apiClient({
        url: `/historisk/alderssak/revurderinger/${revurderingId}/forsorgingstillegg/bekreft`,
        method: 'POST',
    });
}

export async function beregnHistoriskInfotrygdRevurdering(
    request: BeregnHistoriskInfotrygdRevurderingRequest,
): Promise<ApiClientResult<BeregnHistoriskInfotrygdRevurderingResponse>> {
    return apiClient({
        url: `/historisk/alderssak/revurderinger/${request.revurderingId}/beregning`,
        method: 'POST',
        body: {
            begrunnelse: request.begrunnelse,
            måneder: request.måneder,
        },
    });
}

const historiskPdfTransformer = (response: Response) => response.blob();

export async function hentHistoriskForhåndsvarselutkast(args: {
    revurderingId: string;
    fritekst: string;
}): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/historisk/alderssak/revurderinger/${args.revurderingId}/forhandsvarsel/utkast`,
        method: 'POST',
        body: { fritekst: args.fritekst },
        bodyTransformer: historiskPdfTransformer,
    });
}

export async function sendHistoriskForhåndsvarsel(args: {
    revurderingId: string;
    fritekst: string;
}): Promise<ApiClientResult<HistoriskInfotrygdRevurdering>> {
    return apiClient({
        url: `/historisk/alderssak/revurderinger/${args.revurderingId}/forhandsvarsel/send`,
        method: 'POST',
        body: { fritekst: args.fritekst },
    });
}

export async function ikkeSendHistoriskForhåndsvarsel(args: {
    revurderingId: string;
    begrunnelse: string;
}): Promise<ApiClientResult<HistoriskInfotrygdRevurdering>> {
    return apiClient({
        url: `/historisk/alderssak/revurderinger/${args.revurderingId}/forhandsvarsel/ikke-send`,
        method: 'POST',
        body: { begrunnelse: args.begrunnelse },
    });
}

export async function lagreHistoriskVedtaksbrev(args: {
    revurderingId: string;
    request: OppdaterHistoriskInfotrygdVedtaksbrevRequest;
}): Promise<ApiClientResult<HistoriskInfotrygdRevurdering>> {
    return apiClient({
        url: `/historisk/alderssak/revurderinger/${args.revurderingId}/vedtaksbrev`,
        method: 'POST',
        body: args.request,
    });
}

export async function hentHistoriskVedtaksbrevutkast(revurderingId: string): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/historisk/alderssak/revurderinger/${revurderingId}/vedtaksbrevutkast`,
        method: 'GET',
        bodyTransformer: historiskPdfTransformer,
    });
}

export async function sendHistoriskRevurderingTilAttestering(
    revurderingId: string,
): Promise<ApiClientResult<HistoriskInfotrygdRevurdering>> {
    return apiClient({
        url: `/historisk/alderssak/revurderinger/${revurderingId}/send-til-attestering`,
        method: 'POST',
    });
}

export async function underkjennHistoriskRevurdering(args: {
    revurderingId: string;
    begrunnelse: string;
}): Promise<ApiClientResult<HistoriskInfotrygdRevurdering>> {
    return apiClient({
        url: `/historisk/alderssak/revurderinger/${args.revurderingId}/underkjenn`,
        method: 'POST',
        body: { begrunnelse: args.begrunnelse },
    });
}

export async function attesterHistoriskRevurdering(
    revurderingId: string,
): Promise<ApiClientResult<HistoriskInfotrygdRevurdering>> {
    return apiClient({
        url: `/historisk/alderssak/revurderinger/${revurderingId}/attester`,
        method: 'POST',
    });
}
