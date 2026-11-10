import { randomUUID } from 'node:crypto';

import { type Logger, pino } from 'pino';
import { pinoHttp } from 'pino-http';

import * as Config from './config.js';
import { httpLogLevel, serializeRequestError } from './errorHandler.js';

const fnrReplacePattern = [/^(\/api\/(?:person|skatt|saker\/info)\/)(\d{11})()/, /^(.*fnr=)(\d{11})()/];

function safeRequestUrl(url: string | undefined): string | undefined {
    return url?.split('?', 1)[0]?.replaceAll(/\d{11}/g, '***********');
}

export const logger: Logger = pino({
    level: Config.server.logLevel,
    ...(Config.isDev
        ? {
              transport: {
                  target: 'pino-pretty',
                  options: {
                      colorize: true,
                  },
              },
          }
        : {}),
    formatters: {
        level(level) {
            return { level };
        },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
        paths: ['req.headers', 'res.headers', 'req.url'],
        censor: (value) => {
            if (typeof value === 'string') {
                return fnrReplacePattern.reduce((acc, regex) => acc.replace(regex, '$1***********$3'), value);
            }
            return '[Redacted]';
        },
    },
});

export const httpLogger = pinoHttp({
    logger: logger,
    wrapSerializers: false,
    serializers: {
        err: serializeRequestError,
        req(req) {
            return {
                id: req.id,
                method: req.method,
                url: safeRequestUrl(req.url),
            };
        },
        res(res) {
            return {
                statusCode: res.statusCode,
            };
        },
    },
    customLogLevel: httpLogLevel,
    genReqId(req) {
        return req.headers['x-correlation-id'] || req.id || randomUUID();
    },
});
