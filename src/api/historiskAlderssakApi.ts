import {
    HarHistoriskAlderssakResponse,
    HistoriskAlderssakRequest,
    HistoriskeAldersmånedsbeløpRequest,
    HistoriskMånedsbeløpsperiode,
    HistoriskVedtaksperiode,
} from '~src/types/HistoriskAlderssak';

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
