import * as RemoteData from '@devexperts/remote-data-ts';
import { AsyncThunk } from '@reduxjs/toolkit';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ApiClientResult, ApiError } from '~src/api/apiClient';
import { useAppDispatch } from '~src/redux/Store';

import { SuccessNotificationState } from './routes';

export const useDocTitle = (title: string) => {
    useEffect(() => {
        document.title = `${title} – Supplerende Stønad`;
    }, [title]);
};

export const useNotificationFromLocation = () => {
    const [locationState, setLocationState] = useState<SuccessNotificationState | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        setLocationState(location.state as SuccessNotificationState);
        navigate(location.pathname, { replace: true, state: null });
    }, []);
    return locationState;
};

export type ApiResult<U> = RemoteData.RemoteData<ApiError, U>;
export function useAsyncActionCreator<Params, Returned>(
    actionCreator: AsyncThunk<Returned, Params, { rejectValue: ApiError }>,
): [
    ApiResult<Returned>,
    (
        args: Params,
        onSuccess?: (result: Returned) => void | Promise<void>,
        onFailure?: (error: ApiError) => void | Promise<void>,
    ) => Promise<'ok' | 'error' | void>,
    () => void,
] {
    const [apiResult, setApiResult] = useState<ApiResult<Returned>>(RemoteData.initial);
    const dispatch = useAppDispatch();

    const callFn = useCallback(
        async (
            args: Params,
            onSuccess?: (result: Returned) => void | Promise<void>,
            onFailure?: (error: ApiError) => void | Promise<void>,
        ) => {
            if (!RemoteData.isPending(apiResult)) {
                setApiResult(RemoteData.pending);

                //Casten her kan kanskje føre til noen problemer. Ny oppdateringer av redux-toolkit 2.6.1 krever at args må være Params & undefined.
                //Noe som ikke gir veldig mye mening siden den ikke kan være definert og ikke definert. Noe underlig 'under the hood' fører til denne typen.
                const action = await dispatch(actionCreator(args as Params & undefined));

                if (actionCreator.fulfilled.match(action)) {
                    setApiResult(RemoteData.success(action.payload));
                    await onSuccess?.(action.payload);
                    return 'ok';
                } else {
                    //vi forventer vel alltid en payload?
                    setApiResult(RemoteData.failure(action.payload!));
                    await onFailure?.(action.payload!);
                    return 'error';
                }
            }
            return void 0;
        },
        [apiResult, actionCreator],
    );

    const resetToInitial = useCallback(() => {
        setApiResult(RemoteData.initial);
    }, [setApiResult]);

    return [apiResult, callFn, resetToInitial];
}

export function useApiCall<T, U>(
    fn: (req: T) => Promise<ApiClientResult<U>>,
): [ApiResult<U>, (args: T, onSuccess?: (result: U) => void) => void, () => void] {
    const [apiResult, setApiResult] = useState<ApiResult<U>>(RemoteData.initial);

    const callFn = useCallback(
        async (args: T, onSuccess?: (result: U) => void) => {
            if (!RemoteData.isPending(apiResult)) {
                setApiResult(RemoteData.pending);

                const res = await fn(args).then(
                    (res) => res,
                    (res) => res,
                );
                if (res.status === 'ok') {
                    setApiResult(RemoteData.success(res.data));
                    onSuccess?.(res.data);
                } else {
                    setApiResult(RemoteData.failure(res.error));
                }
            }
        },
        [apiResult, fn],
    );

    const resetToInitial = useCallback(() => {
        setApiResult(RemoteData.initial);
    }, [setApiResult]);

    return [apiResult, callFn, resetToInitial];
}

export function useBrevForhåndsvisning<T>(
    fetchBrev: (args: T) => Promise<ApiClientResult<Blob>>,
): [ApiResult<Blob>, (args: T) => void, () => void] {
    const [status, forhåndsvisBrev, resetToInitial] = useApiCall(fetchBrev);

    return [
        status,
        (args: T) => {
            forhåndsvisBrev(args, (blob) => {
                window.open(URL.createObjectURL(blob));
            });
        },
        resetToInitial,
    ];
}

/**
 * useAutosave er for bruk dersom du vil kalle på en funksjon etter X sekunder, der endringer i dependencies resetter timeren.
 *
 * @param callback - funksjonen som skal kjøres for hver delay
 * @param delay - tiden i millisekunder autosaven skal kjøres
 * @param deps - Et set med dependencies som resetter timeren for hver endring
 */
export const useAutosave = (callback: () => void, delay = 500, deps: unknown[] = []) => {
    useEffect(() => {
        if (delay) {
            const interval = setInterval(callback, delay);

            return () => clearInterval(interval);
        }

        return;
    }, [delay, ...deps]);
};

/**
 * useAutosaveOnChange er for bruk dersom du vil kalle på en funksjon hvert X sekund, & dersom data har endret på seg - Tenk litt som google docs
 *
 * @param data - dataen som sjekkes på om ting har endret seg
 * @param callback - funksjonen som skal kjøres
 * @param delay - tiden i millisekunder autosaven skal kjøres
 */
export const useAutosaveOnChange = <T>(data: T, callback: () => Promise<void> | void, delay = 1000) => {
    const [isSaving, setIsSaving] = useState(false);
    const initialRender = useRef(true);
    const prev = useRef(data);
    const live = useRef(data);

    useAutosave(
        async () => {
            if (initialRender.current) return;

            if (prev.current !== live.current) {
                prev.current = live.current;

                await callback();
                setIsSaving(false);
            }
        },
        delay,
        [live.current],
    );

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            return;
        } else {
            setIsSaving(true);
        }
        live.current = data;
    }, [data]);

    return { isSaving };
};
