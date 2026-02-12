import { pino } from 'pino';
import { pinoHttp } from 'pino-http';

import * as Config from './config.js';

const fnrReplacePattern = [/^(\/api\/(?:person|skatt|saker\/info)\/)(\d{11})()/, /^(.*fnr=)(\d{11})()/];
export const logger: pino.Logger = pino({
    ...(Config.isDev
        ? {
              transport: {
                  target: 'pino-pretty',
                  options: {
                      colorize: true,
                  },
              },
              level: Config.server.logLevel,
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
    customLogLevel(_req, res, err) {
        if (err || res.statusCode >= 500) {
            return 'error';
        }
        if (res.statusCode >= 400) {
            return 'warn';
        }
        return 'info';
    },
    genReqId(req) {
        return req.headers['X-Correlation-ID'] || req.id;
    },
});
