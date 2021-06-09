import * as RemoteData from '@devexperts/remote-data-ts';
import { AsyncThunk } from '@reduxjs/toolkit';
import React, { useState } from 'react';
import { createIntlCache, createIntl } from 'react-intl';
import { useHistory, useLocation } from 'react-router-dom';

import { ApiClientResult, ApiError } from '~api/apiClient';
import { useAppDispatch } from '~redux/Store';

import { SuccessNotificationState } from './routes';

export const useI18n = (args: { messages: Record<string, string> }) => {
    const intl = React.useMemo(() => {
        const cache = createIntlCache();
        return createIntl({ locale: 'nb-NO', messages: args.messages }, cache);
    }, [args.messages]);

    return intl;
};

export const useDocTitle = (title: string) => {
    React.useEffect(() => {
        document.title = `${title} – Supplerende Stønad`;
    }, [title]);
};

export const useNotificationFromLocation = () => {
    const [locationState, setLocationState] = useState<SuccessNotificationState | null>(null);
    const history = useHistory();
    const location = useLocation<SuccessNotificationState>();
    React.useEffect(() => {
        setLocationState(location.state);
        history.replace(location.pathname, null);
    }, []);
    return locationState;
};

export type ApiResult<U, TErrorCode extends string = string> = RemoteData.RemoteData<
    ApiError<TErrorCode> | undefined,
    U
>;
export function useAsyncActionCreator<T, U, TErrorCode extends string = string>(
    actionCreator: AsyncThunk<U, T, { rejectValue: ApiError<TErrorCode> }>
): [ApiResult<U, TErrorCode>, (args: T, onSuccess?: (result: U) => void) => void] {
    const [apiResult, setApiResult] = useState<ApiResult<U, TErrorCode>>(RemoteData.initial);
    const dispatch = useAppDispatch();

    const callFn = React.useCallback(
        (args: T, onSuccess?: (result: U) => void) => {
            if (!RemoteData.isPending(apiResult)) {
                setApiResult(RemoteData.pending);

                dispatch(actionCreator(args)).then((action) => {
                    if (actionCreator.fulfilled.match(action)) {
                        setApiResult(RemoteData.success(action.payload));
                        onSuccess?.(action.payload);
                    } else {
                        setApiResult(RemoteData.failure(action.payload));
                    }
                });
            }
        },
        [apiResult, actionCreator]
    );

    return [apiResult, callFn];
}

/**
 * @param actionCreator action creator
 * @param argsTransformer funksjon som gjør at man kan "partially apply"-e action creatoren. Dersom argsTransformer returnerer `undefined` vil ikke actionen bli dispatchet.
 * @param onSuccess callback som kalles når action creator-en returnerer suksess
 */
export function useAsyncActionCreatorWithArgsTransformer<
    TSuccess,
    TThunkArgs,
    TArgs,
    TErrorCode extends string = string
>(
    actionCreator: AsyncThunk<TSuccess, TThunkArgs, { rejectValue: ApiError<TErrorCode> }>,
    argsTransformer: (args: TArgs) => TThunkArgs | undefined,
    onSuccess?: (args: TArgs, data: TSuccess) => void
): [ApiResult<TSuccess, TErrorCode>, (args: TArgs) => void] {
    const [apiResult, call] = useAsyncActionCreator(actionCreator);

    const callFn = React.useCallback(
        (x: TArgs) => {
            const args = argsTransformer(x);
            if (typeof args !== 'undefined') {
                call(args, onSuccess ? (data) => onSuccess(x, data) : undefined);
            }
        },
        [argsTransformer, call]
    );

    return [apiResult, callFn];
}

export function useApiCall<T, U>(
    fn: (req: T) => Promise<ApiClientResult<U>>
): [ApiResult<U>, (args: T, onSuccess?: (result: U) => void) => void] {
    const [apiResult, setApiResult] = useState<ApiResult<U>>(RemoteData.initial);

    const callFn = React.useCallback(
        async (args: T, onSuccess?: (result: U) => void) => {
            if (!RemoteData.isPending(apiResult)) {
                setApiResult(RemoteData.pending);

                const res = await fn(args);
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

    return [apiResult, callFn];
}

export function useBrevForhåndsvisning<T>(
    fetchBrev: (args: T) => Promise<ApiClientResult<Blob, string>>
): [ApiResult<Blob>, (args: T) => void] {
    const [status, forhåndsvisBrev] = useApiCall(fetchBrev);

    return [
        status,
        (args: T) => {
            forhåndsvisBrev(args, (blob) => {
                window.open(URL.createObjectURL(blob));
            });
        },
    ];
}
