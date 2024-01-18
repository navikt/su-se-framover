import * as RemoteData from '@devexperts/remote-data-ts';
import { AsyncThunk } from '@reduxjs/toolkit';
import { useEffect, useMemo, useState } from 'react';
import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ApiClientResult, ApiError } from '~src/api/apiClient';
import { useAppDispatch } from '~src/redux/Store';

import { SuccessNotificationState } from './routes';

export const useDocTitle = (title: string) => {
    React.useEffect(() => {
        document.title = `${title} – Supplerende Stønad`;
    }, [title]);
};

export const useNotificationFromLocation = () => {
    const [locationState, setLocationState] = useState<SuccessNotificationState | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    React.useEffect(() => {
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

    const callFn = React.useCallback(
        async (
            args: Params,
            onSuccess?: (result: Returned) => void | Promise<void>,
            onFailure?: (error: ApiError) => void | Promise<void>,
        ) => {
            if (!RemoteData.isPending(apiResult)) {
                setApiResult(RemoteData.pending);

                const action = await dispatch(actionCreator(args));

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

    const resetToInitial = React.useCallback(() => {
        setApiResult(RemoteData.initial);
    }, [setApiResult]);

    return [apiResult, callFn, resetToInitial];
}

export function useApiCall<T, U>(
    fn: (req: T) => Promise<ApiClientResult<U>>,
): [ApiResult<U>, (args: T, onSuccess?: (result: U) => void) => void, () => void] {
    const [apiResult, setApiResult] = useState<ApiResult<U>>(RemoteData.initial);

    const callFn = React.useCallback(
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

    const resetToInitial = React.useCallback(() => {
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
 * Returnerer det første ikke-initial remoteDataen.
 * Dersom det finnes flere ikke-initial remotedataer, blir fortsatt bare den første returnert. Her har rekkefølge noe å si
 * Da vil du kanskje heller bruke RemoteData.combine() hvis du skal ha begge aktive
 */
export const useExclusiveCombine = <Error, Success>(...args: Array<RemoteData.RemoteData<Error, Success>>) => {
    if (args.length <= 0) {
        throw new Error('UseExclusiveCombine må ta inn en liste med elementer');
    }
    return useMemo(() => {
        return args.find((a) => !RemoteData.isInitial(a)) ?? args[0];
    }, [args]);
};

/**
 * useAutosave er for bruk dersom du vil kalle på en funksjon etter X sekunder, der endringer i dependencies resetter timeren.
 *
 * @param callback - funksjonen som skal kjøres for hver delay
 * @param delay - tiden i millisekunder autosaven skal kjøres
 * @param deps - Et set med dependencies som resetter timeren for hver endring
 */
export const useAutosave = (callback: () => void, delay = 5000, deps: unknown[] = []) => {
    React.useEffect(() => {
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
export const useAutosaveOnChange = <T>(data: T, callback: () => void, delay = 5000) => {
    const [isSaving, setIsSaving] = React.useState(false);
    const initialRender = React.useRef(true);
    const prev = React.useRef(data);
    const live = React.useRef(data);

    useAutosave(async () => {
        if (prev.current !== live.current) {
            prev.current = live.current;
            callback();
        } else {
            setIsSaving(false);
        }
    }, delay);

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
        } else {
            setIsSaving(true);
        }
        live.current = data;
    }, [data]);

    return { isSaving };
};
