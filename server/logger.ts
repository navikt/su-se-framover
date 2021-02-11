import pino from 'pino';
import pinoColada from 'pino-colada';
import pinoHttp from 'pino-http';

import * as Config from './config';

const fnrReplacePattern = [/^(\/api\/person\/)(\d{11})()/, /^(.*fnr=)(\d{11})()/];
export const logger: pino.Logger = pino({
    ...(Config.isDev
        ? {
              prettyPrint: true,
              prettifier: pinoColada,
              level: Config.server.logLevel,
          }
        : {}),
    formatters: {
        level(level, _number) {
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
    genReqId(req) {
        return req.headers['X-Correlation-ID'] || req.id;
    },
    autoLogging: {
        getPath: (req) => (/^\/api\/(?!toggles)/.test(req.url ?? '') ? req.url : 'ignore'),
        ignorePaths: ['ignore'],
    },
});
