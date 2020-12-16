import { guid } from 'nav-frontend-js-utils';

import * as Cookies from '~lib/cookies';
import { CookieName } from '~lib/cookies';

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
}

export type ApiClientResult<T> = { status: 'ok'; data: T; statusCode: number } | { status: 'error'; error: ApiError };

function error<T = unknown>(e: ApiError): ApiClientResult<T> {
    return {
        status: 'error',
        error: e,
    };
}

function success<T>(data: T, statusCode: number): ApiClientResult<T> {
    return {
        status: 'ok',
        data,
        statusCode,
    };
}

type Method = 'GET' | 'PUT' | 'POST' | 'PATCH';

export default async function apiClient<T>(arg: {
    url: string;
    method: Method;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: Record<string, any>;
    request?: Partial<Request>;
    successStatusCodes?: number[];
    extraData?: { accessToken: string; correlationId: string; numAttempts: number };
    bodyTransformer?: (res: Response) => Promise<T>;
}): Promise<ApiClientResult<T>> {
    const accessToken = arg.extraData?.accessToken ?? Cookies.get(Cookies.CookieName.AccessToken);
    const refreshToken = Cookies.get(Cookies.CookieName.RefreshToken);
    const correlationId = arg.extraData?.correlationId ?? guid();

    if ((arg.extraData?.numAttempts ?? 0) > 1) {
        return error({
            statusCode: ErrorCode.Unknown,
            body: null,
            correlationId,
        });
    }

    const res = await fetch(`${window.BASE_URL}${arg.url}`, {
        ...arg.request,
        method: arg.method,
        headers: {
            ...(arg.request ? arg.request.headers : null),
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            'X-Correlation-ID': correlationId,
        },
        body: arg.body ? JSON.stringify(arg.body) : undefined,
    });

    if (res.status === 401) {
        if (refreshToken) {
            const refreshRes = await fetch(`${window.BASE_URL}/auth/refresh`, {
                headers: {
                    refresh_token: refreshToken,
                    'X-Correlation-ID': correlationId,
                },
            });

            const nyttAccessToken = refreshRes.headers.get('access_token');
            const nyttRefreshToken = refreshRes.headers.get('refresh_token');

            if (nyttRefreshToken) {
                Cookies.set(CookieName.RefreshToken, nyttRefreshToken);
            }
            if (nyttAccessToken) {
                Cookies.set(CookieName.AccessToken, nyttAccessToken);

                return apiClient({
                    ...arg,
                    extraData: {
                        ...arg.extraData,
                        accessToken: nyttAccessToken,
                        correlationId,
                        numAttempts: (arg.extraData?.numAttempts ?? 0) + 1,
                    },
                });
            }
        }

        return error({
            statusCode: res.status,
            correlationId,
            body: null,
        });
    } else if (res.status === 403) {
        return error({
            statusCode: res.status,
            correlationId,
            body: null,
        });
    }

    if (res.ok || arg.successStatusCodes?.includes(res.status)) {
        if (arg.bodyTransformer) {
            return success<T>(await arg.bodyTransformer(res), res.status);
        }
        return success<T>(await res.json(), res.status);
    }

    return error({
        statusCode: res.status,
        correlationId,
        body: await res.json(),
    });
}
