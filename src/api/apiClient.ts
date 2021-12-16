import { v4 as uuid } from 'uuid';

import { ApiErrorCode } from '~components/apiErrorAlert/apiErrorCode';

import Config from '~config';

export enum ErrorCode {
    Unauthorized = 403,
    NotAuthenticated = 401,
    Unknown = -1,
    NotFound = 404,
}

export interface ApiError {
    statusCode: ErrorCode | number;
    correlationId: string;
    body: ErrorMessage | null;
}

export interface ErrorMessage {
    message: string;
    code?: ApiErrorCode;
}

export type ApiClientResult<TSuccess> =
    | { status: 'ok'; data: TSuccess; statusCode: number }
    | { status: 'error'; error: ApiError };

function error<TSuccess = unknown>(e: ApiError): ApiClientResult<TSuccess> {
    return {
        status: 'error',
        error: e as ApiError,
    };
}

function success<TSuccess>(data: TSuccess, statusCode: number): ApiClientResult<TSuccess> {
    return {
        status: 'ok',
        data,
        statusCode,
    };
}

type Method = 'GET' | 'PUT' | 'POST' | 'PATCH';

export default async function apiClient<TSuccess>(arg: {
    url: string;
    method: Method;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: Record<string, any>;
    request?: Partial<Request>;
    successStatusCodes?: number[];
    extraData?: { correlationId: string };
    bodyTransformer?: (res: Response) => Promise<TSuccess>;
}): Promise<ApiClientResult<TSuccess>> {
    const correlationId = arg.extraData?.correlationId ?? uuid();

    const headers = new Headers(arg.request?.headers);
    headers.append('X-Correlation-ID', correlationId);

    const res = await fetch(`/api/${arg.url.startsWith('/') ? arg.url.slice(1) : arg.url}`, {
        ...arg.request,
        method: arg.method,
        headers: headers,
        body: arg.body ? JSON.stringify(arg.body) : undefined,
    });

    if (res.ok || arg.successStatusCodes?.includes(res.status)) {
        if (arg.bodyTransformer) {
            return success<TSuccess>(await arg.bodyTransformer(res), res.status);
        }
        return success<TSuccess>(await res.json(), res.status);
    }

    const authenticateChallengeHeader = res.headers.get('WWW-Authenticate');
    if (
        res.status === ErrorCode.NotAuthenticated &&
        authenticateChallengeHeader &&
        authenticateChallengeHeader.includes('realm=su-se-framover')
    ) {
        window.location.href = `${Config.LOGIN_URL}?redirectTo=${window.location.pathname}`;
    }

    const errorBody: ErrorMessage = await res.json().catch((_err) => ({}));

    return error({
        statusCode: res.status,
        correlationId,
        body: errorBody,
    });
}
