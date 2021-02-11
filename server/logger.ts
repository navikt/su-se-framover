import pino from 'pino';
import pinoColada from 'pino-colada';
import pinoHttp from 'pino-http';

import * as Config from './config';

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
    redact: ['req.headers', 'res.headers'],
});

export const httpLogger = pinoHttp({
    logger: logger,
    genReqId(req) {
        return req.headers['X-Correlation-ID'] || req.id;
    },
});
