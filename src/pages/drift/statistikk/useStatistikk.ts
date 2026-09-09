import * as RemoteData from '@devexperts/remote-data-ts';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, ErrorCode } from '~src/api/apiClient';
import { hentStønadstatistikk, pollSakstatistikk } from '~src/api/statistikkApi';
import { ApiErrorCode } from '~src/components/apiErrorAlert/apiErrorCode';
import {
    SakStatistikkParams,
    SakStatistikkResponse,
    StønadStatistikkParams,
    StønadStatistikkResponse,
} from '~src/types/Statistikk';

const erAvbrutt = (error: unknown): boolean => error instanceof DOMException && error.name === 'AbortError';

const tilApiError = (error: unknown): ApiError => ({
    statusCode: ErrorCode.Unknown,
    correlationId: '',
    body: {
        message: error instanceof Error ? error.message : 'Statistikken kunne ikke hentes',
        code: ApiErrorCode.UKJENT_FEIL,
    },
});

export const useSakstatistikk = (params: SakStatistikkParams) => {
    const [status, setStatus] = useState<RemoteData.RemoteData<ApiError, SakStatistikkResponse>>(RemoteData.initial);
    const [genererer, setGenererer] = useState(false);
    const [forsøk, setForsøk] = useState(0);

    const prøvIgjen = useCallback(() => setForsøk((verdi) => verdi + 1), []);

    useEffect(() => {
        const controller = new AbortController();
        setStatus(RemoteData.pending);
        setGenererer(false);

        pollSakstatistikk(params, controller.signal, () => setGenererer(true))
            .then((resultat) => {
                if (controller.signal.aborted) return;
                setGenererer(false);
                setStatus(
                    resultat.status === 'ok' ? RemoteData.success(resultat.data) : RemoteData.failure(resultat.error),
                );
            })
            .catch((error: unknown) => {
                if (!erAvbrutt(error)) {
                    setGenererer(false);
                    setStatus(RemoteData.failure(tilApiError(error)));
                }
            });

        return () => controller.abort();
    }, [params.fraOgMed, params.tilOgMed, params.oppløsning, forsøk]);

    return { status, genererer, prøvIgjen };
};

export const useStønadstatistikk = (params: StønadStatistikkParams) => {
    const [status, setStatus] = useState<RemoteData.RemoteData<ApiError, StønadStatistikkResponse>>(RemoteData.initial);
    const controllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;
        setStatus(RemoteData.pending);

        hentStønadstatistikk(params, controller.signal)
            .then((resultat) => {
                if (controller.signal.aborted) return;
                setStatus(
                    resultat.status === 'ok' ? RemoteData.success(resultat.data) : RemoteData.failure(resultat.error),
                );
            })
            .catch((error: unknown) => {
                if (!erAvbrutt(error)) {
                    setStatus(RemoteData.failure(tilApiError(error)));
                }
            });

        return () => controller.abort();
    }, [params.fraOgMed, params.tilOgMed]);

    return status;
};
