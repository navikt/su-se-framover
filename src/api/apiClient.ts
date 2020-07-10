import { guid } from 'nav-frontend-js-utils';
import * as Cookies from '~lib/cookies';
import { CookieName } from '~lib/cookies';

export enum ErrorCode {
    Unauthorized = 'unauthorized',
    NotAuthenticated = 'not-authenticated',
    Unknown = 'unknown',
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
}): Promise<ApiClientResult<T>> {
    const accessToken = arg.extraData?.accessToken ?? Cookies.get(Cookies.CookieName.AccessToken);
    const refreshToken = Cookies.get(Cookies.CookieName.RefreshToken);
    const correlationId = arg.extraData?.correlationId ?? guid();

    if ((arg.extraData?.numAttempts ?? 0) > 1) {
        return error({
            code: ErrorCode.Unknown,
            body: null,
            correlationId,
            statusCode: 0,
        });
    }

    const res = await fetch(`${window.BASE_URL}${arg.url}`, {
        ...arg.request,
        method: arg.method,
        headers: {
            ...arg.request?.headers,
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
            code: ErrorCode.NotAuthenticated,
            statusCode: res.status,
            correlationId,
            body: null,
        });
    } else if (res.status === 403) {
        return error({
            code: ErrorCode.Unauthorized,
            statusCode: res.status,
            correlationId,
            body: null,
        });
    }

    if (res.ok || arg.successStatusCodes?.includes(res.status)) {
        return success<T>(await res.json(), res.status);
    }

    return error({
        code: ErrorCode.Unknown,
        statusCode: res.status,
        correlationId,
        body: await res.json(),
    });
}
