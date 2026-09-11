import { ApiErrorCode } from '~src/components/apiErrorAlert/apiErrorCode';
import {
    GenerererStatistikkResponse,
    GenerererStønadstatistikkResponse,
    SakStatistikkParams,
    SakStatistikkResponse,
    StønadStatistikkParams,
    StønadStatistikkResponse,
} from '~src/types/Statistikk';

import apiClient, { ApiClientResult, ApiError, ErrorCode } from './apiClient';

export const POLLING_INTERVAL_MS = 3_000;
export const MAX_POLLING_TIME_MS = 120_000;

type SakStatistikkApiResponse = SakStatistikkResponse | GenerererStatistikkResponse;
type StønadStatistikkApiResponse = StønadStatistikkResponse | GenerererStønadstatistikkResponse;

const lagApiError = (message: string, statusCode: number = ErrorCode.Unknown): ApiError => ({
    statusCode,
    correlationId: '',
    body: {
        message,
        code: ApiErrorCode.UKJENT_FEIL,
    },
});

export const buildSakstatistikkUrl = (params: SakStatistikkParams): string => {
    const query = new URLSearchParams({
        fraOgMed: params.fraOgMed,
        tilOgMed: params.tilOgMed,
        opplosning: params.oppløsning.toLocaleLowerCase('nb-NO'),
    });
    return `/statistikk/sak?${query.toString()}`;
};

export const hentSakstatistikk = (
    params: SakStatistikkParams,
    signal: AbortSignal,
): Promise<ApiClientResult<SakStatistikkApiResponse>> =>
    apiClient({
        url: buildSakstatistikkUrl(params),
        method: 'GET',
        request: {
            headers: new Headers({ Accept: 'application/json' }),
            signal,
        },
    });

export const hentStønadstatistikk = (
    params: StønadStatistikkParams,
    signal: AbortSignal,
): Promise<ApiClientResult<StønadStatistikkApiResponse>> => {
    const query = new URLSearchParams({
        fraOgMed: params.fraOgMed,
        tilOgMed: params.tilOgMed,
    });
    return apiClient({
        url: `/statistikk/stønad?${query.toString()}`,
        method: 'GET',
        request: {
            headers: new Headers({ Accept: 'application/json' }),
            signal,
        },
    });
};

const erGenereringsrespons = (data: SakStatistikkApiResponse): data is GenerererStatistikkResponse =>
    'status' in data && data.status === 'GENERERER';

const erStønadGenereringsrespons = (data: StønadStatistikkApiResponse): data is GenerererStønadstatistikkResponse =>
    'status' in data && data.status === 'GENERERER';

const vent = (millisekunder: number, signal: AbortSignal): Promise<void> =>
    new Promise((resolve, reject) => {
        const timeout = window.setTimeout(resolve, millisekunder);
        signal.addEventListener(
            'abort',
            () => {
                window.clearTimeout(timeout);
                reject(new DOMException('Kallet ble avbrutt', 'AbortError'));
            },
            { once: true },
        );
    });

export async function pollSakstatistikk(
    params: SakStatistikkParams,
    signal: AbortSignal,
    onGenererer: () => void,
    hent: typeof hentSakstatistikk = hentSakstatistikk,
    ventPåNesteForsøk: typeof vent = vent,
): Promise<ApiClientResult<SakStatistikkResponse>> {
    const startet = Date.now();

    while (true) {
        const resultat = await hent(params, signal);
        if (resultat.status === 'error') {
            return resultat;
        }
        if (resultat.statusCode === 200 && !erGenereringsrespons(resultat.data)) {
            return { status: 'ok', data: resultat.data, statusCode: resultat.statusCode };
        }
        if (resultat.statusCode !== 202 || !erGenereringsrespons(resultat.data)) {
            return { status: 'error', error: lagApiError('Statistikktjenesten svarte med et ukjent format') };
        }

        onGenererer();
        if (Date.now() - startet >= MAX_POLLING_TIME_MS) {
            return {
                status: 'error',
                error: lagApiError('Det tok for lang tid å lage statistikken'),
            };
        }
        await ventPåNesteForsøk(POLLING_INTERVAL_MS, signal);
    }
}

export async function pollStønadstatistikk(
    params: StønadStatistikkParams,
    signal: AbortSignal,
    onGenererer: () => void,
    hent: typeof hentStønadstatistikk = hentStønadstatistikk,
    ventPåNesteForsøk: typeof vent = vent,
): Promise<ApiClientResult<StønadStatistikkResponse>> {
    const startet = Date.now();

    while (true) {
        const resultat = await hent(params, signal);
        if (resultat.status === 'error') {
            return resultat;
        }
        if (resultat.statusCode === 200 && !erStønadGenereringsrespons(resultat.data)) {
            return { status: 'ok', data: resultat.data, statusCode: resultat.statusCode };
        }
        if (resultat.statusCode !== 202 || !erStønadGenereringsrespons(resultat.data)) {
            return { status: 'error', error: lagApiError('Statistikktjenesten svarte med et ukjent format') };
        }

        onGenererer();
        if (Date.now() - startet >= MAX_POLLING_TIME_MS) {
            return {
                status: 'error',
                error: lagApiError('Det tok for lang tid å lage statistikken'),
            };
        }
        await ventPåNesteForsøk(POLLING_INTERVAL_MS, signal);
    }
}
