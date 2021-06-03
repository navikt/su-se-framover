import * as RemoteData from '@devexperts/remote-data-ts';
import React, { useState } from 'react';
import { createIntlCache, createIntl } from 'react-intl';
import { useHistory, useLocation } from 'react-router-dom';

import { ApiClientResult, ApiError } from '~api/apiClient';

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
// function useDispatchCall<T, U>(
//     fn: AsyncThunk<U, T, { rejectValue: ApiError }>
// ): [ApiResult<U>, (args: T, onSuccess?: (result: U) => void) => void] {
//     const [apiResult, setApiResult] = useState<ApiResult<U>>(RemoteData.initial);
//     const dispatch = useAppDispatch();

//     const callFn = React.useCallback(
//         (args: T, onSuccess?: (result: U) => void) => {
//             if (!RemoteData.isPending(apiResult)) {
//                 setApiResult(RemoteData.pending);

//                 dispatch(fn(args)).then((action) => {
//                     if (fn.fulfilled.match(action)) {
//                         setApiResult(RemoteData.success(action.payload));
//                         onSuccess?.(action.payload);
//                     } else {
//                         setApiResult(RemoteData.failure(action.payload));
//                     }
//                 });
//             }
//         },
//         [apiResult]
//     );

//     return [apiResult, callFn];
// }

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
        [apiResult]
    );

    return [apiResult, callFn];
}

export function useFetchBrev<T>(
    sliceFn: (args: T) => Promise<ApiClientResult<Blob, string>>
): [ApiResult<Blob>, (args: T) => void] {
    const [status, fetchBrev] = useApiCall(sliceFn);

    return [
        status,
        (args: T) => {
            fetchBrev(args, (blob) => {
                window.open(URL.createObjectURL(blob));
            });
        },
    ];
}
