import { v4 as uuid } from 'uuid';

import { ApiErrorCode } from '~src/components/apiErrorAlert/apiErrorCode';

import { LOGIN_URL } from './authUrl';

export enum ErrorCode {
    Unauthorized = 403,
    NotAuthenticated = 401,
    Unknown = -1,
    NotFound = 404,
}

export interface ApiError {
    statusCode: ErrorCode | number;
    correlationId: string;
    //TODO: gjør body til union type -  error: ErrorMessage | ErrorMessage[]
    body: ErrorMessage;
}

export interface ErrorMessage {
    message: string;
    code: ApiErrorCode;
}

export type ApiClientResult<TSuccess> = ApiClientSuccessResult<TSuccess> | ApiClientFailureResult;
export type ApiClientSuccessResult<TSuccess> = { status: 'ok'; data: TSuccess; statusCode: number };
export type ApiClientFailureResult = { status: 'error'; error: ApiError };

const error = (e: ApiError): ApiClientFailureResult => ({ status: 'error', error: e });
const success = <TSuccess>(data: TSuccess, statusCode: number): ApiClientSuccessResult<TSuccess> => {
    return { status: 'ok', data, statusCode };
};

type Method = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE';

export default async function apiClient<TSuccess>(arg: {
    url: string;
    method: Method;
    // biome-ignore lint/suspicious/noExplicitAny: using any here for flexibility
    body?: Record<string, any>;
    request?: Partial<Request>;
    bodyTransformer?: (res: Response) => Promise<TSuccess>;
}): Promise<ApiClientResult<TSuccess>> {
    const correlationId = uuid();
    const headers = new Headers(arg.request?.headers);

    headers.append('X-Correlation-ID', correlationId);

    const res = await fetch(`/api/${arg.url.startsWith('/') ? arg.url.slice(1) : arg.url}`, {
        ...arg.request,
        method: arg.method,
        headers: headers,
        body: arg.body ? (arg.body instanceof FormData ? arg.body : JSON.stringify(arg.body)) : undefined,
    });

    if (res.ok) {
        if (arg.bodyTransformer) {
            return success(await arg.bodyTransformer(res), res.status);
        }
        return success(await res.json(), res.status);
    }

    const authenticateChallengeHeader = res.headers.get('WWW-Authenticate');
    if (
        res.status === ErrorCode.NotAuthenticated &&
        authenticateChallengeHeader &&
        authenticateChallengeHeader.includes('realm=su-se-framover')
    ) {
        window.location.href = `${LOGIN_URL}?redirectTo=${window.location.pathname}`;
    }

    const errorBody: ErrorMessage = await res.json().catch(() => ({}));

    return error({ statusCode: res.status, correlationId, body: errorBody });
}
