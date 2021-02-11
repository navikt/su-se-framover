import crypto from 'crypto';
import { IncomingMessage, ServerResponse } from 'http';

import cors from 'cors';
import express from 'express';
import exphbs from 'express-handlebars';
import helmet from 'helmet';

import setupAuth from './auth';
import * as AuthUtils from './auth/utils';
import * as Config from './config';
import { httpLogger, logger } from './logger';
import setupProxy from './proxy';
import routes from './routes';
import setupSession from './session';

export default async function startServer() {
    const app = express();
    logger.info(`Using log level: ${Config.server.logLevel}`);

    app.use(httpLogger);

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
            contentSecurityPolicy: !Config.isDev
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

    const authClient = await AuthUtils.getOpenIdClient(Config.auth.discoverUrl);
    await setupAuth(app, authClient);

    app.use(setupProxy(authClient));

    app.use(routes());

    const port = Config.server.port;
    app.listen(port, () => {
        logger.info(`Listening on http://:${port}`);
    });
}
