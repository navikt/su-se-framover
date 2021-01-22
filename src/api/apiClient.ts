import { guid } from 'nav-frontend-js-utils';

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
    extraData?: { correlationId: string };
    bodyTransformer?: (res: Response) => Promise<T>;
}): Promise<ApiClientResult<T>> {
    const correlationId = arg.extraData?.correlationId ?? guid();

    const res = await fetch(`/api/${arg.url}`, {
        ...arg.request,
        method: arg.method,
        headers: {
            ...(arg.request ? arg.request.headers : null),
            'X-Correlation-ID': correlationId,
        },
        body: arg.body ? JSON.stringify(arg.body) : undefined,
    });

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
