import { type IncomingMessage, type ServerResponse, STATUS_CODES } from 'node:http';

import type { ErrorRequestHandler, NextFunction, Response } from 'express';
import type { Level } from 'pino';

const responseByNetworkErrorCode = {
    ECONNREFUSED: { status: 503, message: 'Could not contact su-se-bakover' },
    ECONNRESET: { status: 502, message: 'Connection to su-se-bakover was interrupted' },
    EPIPE: { status: 502, message: 'Connection to su-se-bakover was interrupted' },
    ETIMEDOUT: { status: 504, message: 'Timed out contacting su-se-bakover' },
    ESOCKETTIMEDOUT: { status: 504, message: 'Timed out contacting su-se-bakover' },
    ENOTFOUND: { status: 502, message: 'Could not resolve su-se-bakover' },
    EAI_AGAIN: { status: 502, message: 'Could not resolve su-se-bakover' },
};

class RequestError extends Error {
    constructor(
        readonly status: number,
        readonly code: string,
        message: string,
        readonly source: 'proxy' | 'server',
    ) {
        super(message);
        this.name = 'RequestError';
    }
}

function isNetworkErrorCode(code: unknown): code is keyof typeof responseByNetworkErrorCode {
    return typeof code === 'string' && Object.hasOwn(responseByNetworkErrorCode, code);
}

function networkErrorCode(error: unknown): keyof typeof responseByNetworkErrorCode | undefined {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
        return undefined;
    }
    const code = error.code;
    if (isNetworkErrorCode(code)) {
        return code;
    }
    return undefined;
}

function requestError(error: unknown): RequestError {
    if (error instanceof RequestError) {
        return error;
    }
    let status = 500;
    if (typeof error === 'object' && error !== null) {
        const candidate = 'status' in error ? error.status : 'statusCode' in error ? error.statusCode : undefined;
        if (typeof candidate === 'number' && Number.isInteger(candidate) && candidate >= 400 && candidate <= 599) {
            status = candidate;
        }
    }
    return new RequestError(
        status,
        networkErrorCode(error) ?? (status >= 500 ? 'SERVER_ERROR' : 'REQUEST_ERROR'),
        STATUS_CODES[status] ?? 'Request failed',
        'server',
    );
}

export function serializeRequestError(error: unknown) {
    if (!(error instanceof RequestError)) {
        return {
            type: 'Error',
            code: networkErrorCode(error) ?? 'HTTP_ERROR',
            message: 'HTTP request failed',
        };
    }
    return {
        type: error.name,
        code: error.code,
        message: error.message,
        source: error.source,
    };
}

export function proxyErrorHandler(error: unknown, _res: Response, next: NextFunction): void {
    const code = networkErrorCode(error);
    const details = code ? responseByNetworkErrorCode[code] : { status: 500, message: 'Unexpected proxy error' };
    next(new RequestError(details.status, code ?? 'PROXY_ERROR', details.message, 'proxy'));
}

export function httpLogLevel(req: IncomingMessage, res: ServerResponse, error?: Error): Level {
    if (error) {
        return 'error';
    }
    if (res.statusCode >= 500) {
        return !res.err && res.getHeader('X-Su-Error-Logged') === 'true' ? 'warn' : 'error';
    }
    if (res.err) {
        return requestError(res.err).status >= 500 ? 'error' : 'warn';
    }
    if (res.statusCode >= 400 || req.readableAborted || !res.writableFinished) {
        return 'warn';
    }
    return 'info';
}

export const errorHandler: ErrorRequestHandler = (error: unknown, req, res, _next) => {
    const safeError = requestError(error);
    const clientDisconnected = !res.writableFinished && (req.readableAborted || res.destroyed);
    if (
        clientDisconnected &&
        safeError.source === 'proxy' &&
        (safeError.code === 'ECONNRESET' || safeError.code === 'EPIPE')
    ) {
        // Klienten har koblet fra. HTTP-loggen dekker avbruddet; ikke logg proxyens følgefeil på nytt.
        if (!res.destroyed) {
            res.destroy();
        }
        return;
    }

    // Intern overlevering av feilen til pino-http. Feltet sendes ikke til klienten.
    res.err = safeError;
    if (res.destroyed || res.writableFinished) {
        // Responsen er allerede ødelagt eller ferdig skrevet. Ikke send noe mer til klienten.
        return;
    }
    if (res.headersSent) {
        // Responsen er påbegynt, men uferdig. Avbryt i stedet for å sende JSON eller avslutte som normalt.
        res.destroy();
        return;
    }

    // Ingenting er sendt ennå. Send feilrespons uten backendens markør for allerede logget feil.
    res.removeHeader('X-Su-Error-Logged');
    res.status(safeError.status).json({ message: safeError.message });
};
