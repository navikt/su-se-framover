import {
    HarHistoriskAlderssakResponse,
    HistoriskAlderssakRequest,
    HistoriskeAldersmånedsbeløpRequest,
    HistoriskMånedsbeløpsperiode,
    HistoriskVedtaksperiode,
} from '~src/types/HistoriskAlderssak';
import {
    HistoriskInfotrygdAvsluttRequest,
    HistoriskInfotrygdRevurdering,
    HistoriskInfotrygdRevurderingRequest,
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
