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
const API_DEBUG_FLAG = 'SU_DEBUG_API';
const API_REQUEST_TIMEOUT_MS = 30_000;

function erErrorMessage(value: unknown): value is ErrorMessage {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    return 'code' in value && 'message' in value && typeof value.code === 'string' && typeof value.message === 'string';
}

function lagUkjentFeilmelding(message: string): ErrorMessage {
    return {
        code: ApiErrorCode.UKJENT_FEIL,
        message,
    };
}

function normaliserErrorBody(parsedErrorBody: unknown, fallbackMessage: string): ErrorMessage {
    if (erErrorMessage(parsedErrorBody)) {
        return parsedErrorBody;
    }

    if (Array.isArray(parsedErrorBody)) {
        const firstKnownError = parsedErrorBody.find(erErrorMessage);
        if (firstKnownError) {
            return firstKnownError;
        }
    }

    if (typeof parsedErrorBody === 'string' && parsedErrorBody.trim().length > 0) {
        return lagUkjentFeilmelding(parsedErrorBody);
    }

    return lagUkjentFeilmelding(fallbackMessage);
}

function apiDebugEnabled(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    try {
        return window.localStorage.getItem(API_DEBUG_FLAG) === 'true';
    } catch {
        return false;
    }
}

function apiDebugLog(message: string, details: Record<string, unknown>) {
    if (!apiDebugEnabled()) {
        return;
    }

    console.info(`[apiClient] ${message}`, details);
}

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
    const url = `/api/${arg.url.startsWith('/') ? arg.url.slice(1) : arg.url}`;
    const startedAt = performance.now();

    headers.append('X-Correlation-ID', correlationId);

    apiDebugLog('request', {
        method: arg.method,
        url,
        correlationId,
        timeoutMs: API_REQUEST_TIMEOUT_MS,
    });

    let res: Response;
    const controller = new AbortController();
    const timeoutId =
        arg.request?.signal === undefined
            ? setTimeout(() => {
                  controller.abort();
              }, API_REQUEST_TIMEOUT_MS)
            : undefined;
    try {
        res = await fetch(url, {
            ...arg.request,
            method: arg.method,
            headers: headers,
            signal: arg.request?.signal ?? controller.signal,
            body: arg.body ? (arg.body instanceof FormData ? arg.body : JSON.stringify(arg.body)) : undefined,
        });
    } catch (fetchError) {
        const timeoutTriggered = arg.request?.signal === undefined && controller.signal.aborted;
        const message = timeoutTriggered
            ? `Forespørselen tok mer enn ${API_REQUEST_TIMEOUT_MS} ms og ble avbrutt`
            : fetchError instanceof Error
              ? fetchError.message
              : String(fetchError);

        apiDebugLog('network-error', {
            method: arg.method,
            url,
            correlationId,
            message,
            durationMs: Math.round(performance.now() - startedAt),
        });

        return error({
            statusCode: ErrorCode.Unknown,
            correlationId,
            body: lagUkjentFeilmelding(`Nettverksfeil ved kall til ${url}: ${message}`),
        });
    } finally {
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }
    }

    apiDebugLog('response', {
        method: arg.method,
        url,
        correlationId,
        statusCode: res.status,
        durationMs: Math.round(performance.now() - startedAt),
        serverCorrelationId: res.headers.get('x-correlation-id'),
    });

    if (res.ok) {
        if (res.status === 204 || res.status === 205) {
            return success(undefined as TSuccess, res.status);
        }
        if (arg.bodyTransformer) {
            return success(await arg.bodyTransformer(res), res.status);
        }
        const text = await res.text();
        if (!text.trim()) {
            return success(undefined as TSuccess, res.status);
        }
        return success(JSON.parse(text) as TSuccess, res.status);
    }

    const authenticateChallengeHeader = res.headers.get('WWW-Authenticate');
    if (
        res.status === ErrorCode.NotAuthenticated &&
        authenticateChallengeHeader &&
        authenticateChallengeHeader.includes('realm=su-se-framover')
    ) {
        window.location.href = `${LOGIN_URL}?redirectTo=${window.location.pathname}`;
    }

    const responseBodyText = await res.text().catch(() => '');
    const parsedErrorBody =
        responseBodyText.trim().length > 0
            ? (() => {
                  try {
                      return JSON.parse(responseBodyText);
                  } catch {
                      return responseBodyText;
                  }
              })()
            : undefined;

    const errorBody = normaliserErrorBody(parsedErrorBody, `HTTP ${res.status} ${res.statusText}`);

    apiDebugLog('error-response', {
        method: arg.method,
        url,
        correlationId,
        statusCode: res.status,
        parsedErrorBody,
    });

    return error({ statusCode: res.status, correlationId, body: errorBody });
}
