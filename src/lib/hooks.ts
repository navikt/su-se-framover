import * as RemoteData from '@devexperts/remote-data-ts';
import { AsyncThunk } from '@reduxjs/toolkit';
import React, { useState } from 'react';
import { createIntlCache, createIntl } from 'react-intl';
import { useHistory, useLocation } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
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

type ApiResult<U> = RemoteData.RemoteData<ApiError | undefined, U>;
function useApiCall<T, U>(
    fn: AsyncThunk<U, T, { rejectValue: ApiError }>
): [ApiResult<U>, (args: T, onSuccess?: (result: U) => void) => void] {
    const [apiResult, setApiResult] = useState<ApiResult<U>>(RemoteData.initial);
    const dispatch = useAppDispatch();

    const callFn = React.useCallback(
        (args: T, onSuccess?: (result: U) => void) => {
            if (!RemoteData.isPending(apiResult)) {
                setApiResult(RemoteData.pending);

                dispatch(fn(args)).then((action) => {
                    if (fn.fulfilled.match(action)) {
                        setApiResult(RemoteData.success(action.payload));
                        onSuccess?.(action.payload);
                    } else {
                        setApiResult(RemoteData.failure(action.payload));
                    }
                });
            }
        },
        [apiResult]
    );

    return [apiResult, callFn];
}

export function useFetchBrev<T>(
    sliceFn: AsyncThunk<{ objectUrl: string }, T, { rejectValue: ApiError }>
): [ApiResult<{ objectUrl: string }>, (args: T) => void] {
    const [status, fetchBrev] = useApiCall(sliceFn);

    return [
        status,
        (args: T) => {
            fetchBrev(args, ({ objectUrl }) => window.open(objectUrl));
        },
    ];
}
