import { guid } from 'nav-frontend-js-utils';
import * as Cookies from '~lib/cookies';
import { CookieName } from '~lib/cookies';

export enum ErrorCode {
    Unauthorized = 'unauthorized',
    NotAuthenticated = 'not-authenticated',
    Unknown = 'unknown'
}

export interface ApiError {
    code: ErrorCode;
    statusCode: number;
    correlationId: string;
    body: unknown;
}

export type ApiClientResult<T> = { status: 'ok'; data: T; statusCode: number } | { status: 'error'; error: ApiError };

function error<T = unknown>(e: ApiError): ApiClientResult<T> {
    return {
        status: 'error',
        error: e
    };
}

function success<T>(data: T, statusCode: number): ApiClientResult<T> {
    return {
        status: 'ok',
        data,
        statusCode
    };
}

export default async function apiClient<T>(
    url: string,
    request: Partial<Request>,
    successStatusCodes?: number[],
    extraData?: { accessToken: string; correlationId: string; numAttempts: number }
): Promise<ApiClientResult<T>> {
    const accessToken = extraData?.accessToken ?? Cookies.get(Cookies.CookieName.AccessToken);
    const refreshToken = Cookies.get(Cookies.CookieName.RefreshToken);
    const correlationId = extraData?.correlationId ?? guid();

    if ((extraData?.numAttempts ?? 0) > 1) {
        return error({
            code: ErrorCode.Unknown,
            body: null,
            correlationId,
            statusCode: 0
        });
    }

    const res = await fetch(`${window.BASE_URL}${url}`, {
        ...request,
        headers: {
            ...request.headers,
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            'X-Correlation-ID': correlationId
        }
    });

    if (res.status === 401) {
        if (refreshToken) {
            const refreshRes = await fetch('/auth/refresh', {
                headers: {
                    refresh_token: refreshToken,
                    'X-Correlation-ID': correlationId
                }
            });

            const nyttAccessToken = refreshRes.headers.get('access_token');
            const nyttRefreshToken = refreshRes.headers.get('refresh_token');

            if (nyttRefreshToken) {
                Cookies.set(CookieName.RefreshToken, nyttRefreshToken);
            }
            if (nyttAccessToken) {
                Cookies.set(CookieName.AccessToken, nyttAccessToken);

                return apiClient(`${window.BASE_URL}${url}`, request, successStatusCodes, {
                    accessToken: nyttAccessToken,
                    correlationId,
                    numAttempts: 1
                });
            }
        }

        return error({
            code: ErrorCode.NotAuthenticated,
            statusCode: res.status,
            correlationId,
            body: null
        });
    } else if (res.status === 403) {
        return error({
            code: ErrorCode.Unauthorized,
            statusCode: res.status,
            correlationId,
            body: null
        });
    }

    if (res.ok || successStatusCodes?.includes(res.status)) {
        return success<T>(await res.json(), res.status);
    }

    return error({
        code: ErrorCode.Unknown,
        statusCode: res.status,
        correlationId,
        body: await res.json()
    });
}
