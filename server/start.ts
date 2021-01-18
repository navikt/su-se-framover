import crypto from 'crypto';
import { IncomingMessage, ServerResponse } from 'http';

import cors from 'cors';
import express from 'express';
import exphbs from 'express-handlebars';
import helmet from 'helmet';
import pino from 'pino';
import pinoColada from 'pino-colada';
import pinoHttp from 'pino-http';

import setupAuth, { ensureAuthenticated } from './auth';
import startMockOauthServer from './auth/mockServer';
import * as Config from './config';
import routes from './routes';
import setupSession from './session';

export default async function startServer() {
    const authDiscoverUrl = Config.server.isDev ? await startMockOauthServer() : Config.auth.discoverUrl;

    const app = express();

    app.use(
        pinoHttp({
            ...(Config.server.isDev
                ? {
                      prettyPrint: true,
                      prettifier: pinoColada,
                  }
                : {}),
            formatters: {
                level(level, _number) {
                    return { level };
                },
            },
            timestamp: pino.stdTimeFunctions.isoTime,
            genReqId(req) {
                return req.headers['X-Correlation-ID'] || req.id;
            },
            redact: ['req.headers', 'res.headers'],
        })
    );

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use((_req, res, next) => {
        res.locals.cspNonce = crypto.randomBytes(16).toString('hex');
        next();
    });

    app.engine(
        '.html',
        exphbs({
            extname: '.html',
            compilerOptions: {},
        })
    );
    app.set('views', Config.server.frontendDir);
    app.set('view engine', '.html');

    app.use(
        helmet({
            contentSecurityPolicy: !Config.server.isDev
                ? {
                      directives: {
                          defaultSrc: ["'self'", 'data:'],
                          scriptSrc: [
                              "'self'",
                              (_req: IncomingMessage, res: ServerResponse) =>
                                  `'nonce-${((res as unknown) as { locals: { cspNonce: string } }).locals.cspNonce}'`,
                          ],
                          styleSrc: ["'self'", 'fonts.googleapis.com', 'data: ', "'unsafe-inline'"],
                          connectSrc: [
                              "'self'",
                              'su-se-bakover.dev.adeo.no',
                              'su-se-bakover.nais.adeo.no',
                              'amplitude.nav.no',
                          ],
                          fontSrc: ["'self'", 'fonts.gstatic.com', 'data:'],
                      },
                  }
                : false,
        })
    );
    app.use(
        cors({
            origin: Config.server.host,
            allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'X-Requested-With'],
        })
    );

    // Session
    setupSession(app);

    await setupAuth(app, authDiscoverUrl);

    app.get('/authenticated/test', ensureAuthenticated, (_req, res) => {
        if (_req.isAuthenticated()) {
            res.send('hello protected');
        } else {
            res.status(401).send(':(');
        }
    });

    app.use(routes());

    const port = Config.server.port;
    app.listen(port, () => {
        console.log(`Listening on http://:${port}`);
    });
}
