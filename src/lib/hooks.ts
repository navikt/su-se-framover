import * as RemoteData from '@devexperts/remote-data-ts';
import { AsyncThunk } from '@reduxjs/toolkit';
import React, { useState } from 'react';
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

export type ApiResult<U> = RemoteData.RemoteData<ApiError | undefined, U>;
export function useAsyncActionCreator<T, U>(
    actionCreator: AsyncThunk<U, T, { rejectValue: ApiError }>
): [
    ApiResult<U>,
    (
        args: T,
        onSuccess?: (result: U) => void | Promise<void>,
        onFailure?: (error: ApiError | undefined) => void | Promise<void>
    ) => Promise<'ok' | 'error' | 'pending' | void>,
    () => void
] {
    const [apiResult, setApiResult] = useState<ApiResult<U>>(RemoteData.initial);
    const dispatch = useAppDispatch();

    const callFn = React.useCallback(
        async (
            args: T,
            onSuccess?: (result: U) => void | Promise<void>,
            onFailure?: (error: ApiError | undefined) => void | Promise<void>
        ) => {
            if (!RemoteData.isPending(apiResult)) {
                setApiResult(RemoteData.pending);

                const action = await dispatch(actionCreator(args));

                if (actionCreator.fulfilled.match(action)) {
                    setApiResult(RemoteData.success(action.payload));
                    await onSuccess?.(action.payload);
                    return 'ok';
                } else {
                    setApiResult(RemoteData.failure(action.payload));
                    await onFailure?.(action.payload);
                    return 'error';
                }
            }
            return 'pending';
        },
        [apiResult, actionCreator]
    );

    const resetToInitial = React.useCallback(() => {
        setApiResult(RemoteData.initial);
    }, [setApiResult]);

    return [apiResult, callFn, resetToInitial];
}

/**
 * @param actionCreator action creator
 * @param argsTransformer funksjon som gjør at man kan "partially apply"-e action creatoren. Dersom argsTransformer returnerer `undefined` vil ikke actionen bli dispatchet.
 * @param onSuccess callback som kalles når action creator-en returnerer suksess
 */
export function useAsyncActionCreatorWithArgsTransformer<TSuccess, TThunkArgs, TArgs>(
    actionCreator: AsyncThunk<TSuccess, TThunkArgs, { rejectValue: ApiError }>,
    argsTransformer: (args: TArgs) => TThunkArgs | undefined,
    onSuccess?: (args: TArgs, data: TSuccess) => void
): [ApiResult<TSuccess>, (args: TArgs) => void, () => void] {
    const [apiResult, call, resetToInitial] = useAsyncActionCreator(actionCreator);

    const callFn = React.useCallback(
        (x: TArgs) => {
            const args = argsTransformer(x);
            if (typeof args !== 'undefined') {
                call(args, onSuccess ? (data) => onSuccess(x, data) : undefined);
            }
        },
        [argsTransformer, call]
    );

    return [apiResult, callFn, resetToInitial];
}

export function useApiCall<T, U>(
    fn: (req: T) => Promise<ApiClientResult<U>>
): [ApiResult<U>, (args: T, onSuccess?: (result: U) => void) => void, () => void] {
    const [apiResult, setApiResult] = useState<ApiResult<U>>(RemoteData.initial);

    const callFn = React.useCallback(
        async (args: T, onSuccess?: (result: U) => void) => {
            if (!RemoteData.isPending(apiResult)) {
                setApiResult(RemoteData.pending);

                const res = await fn(args).then(
                    (res) => res,
                    (res) => res
                );
                if (res.status === 'ok') {
                    setApiResult(RemoteData.success(res.data));
                    onSuccess?.(res.data);
                } else {
                    setApiResult(RemoteData.failure(res.error));
                }
            }
        },
        [apiResult, fn]
    );

    const resetToInitial = React.useCallback(() => {
        setApiResult(RemoteData.initial);
    }, [setApiResult]);

    return [apiResult, callFn, resetToInitial];
}

export function useBrevForhåndsvisning<T>(
    fetchBrev: (args: T) => Promise<ApiClientResult<Blob>>
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
