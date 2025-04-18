import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import setupAuth from './auth/index.js';
import * as AuthUtils from './auth/utils.js';
import * as Config from './config.js';
import { httpLogger, logger } from './logger.js';
import setupProxy from './proxy.js';
import redirectMiddleware from './redirect.js';
import routes from './routes.js';

const hotjarCsp = {
    imgSrc: ['http://*.hotjar.com', 'https://*.hotjar.com', 'http://*.hotjar.io', 'https://*.hotjar.io'],
    scriptSrc: [
        'http://*.hotjar.com',
        'https://*.hotjar.com',
        'http://*.hotjar.io',
        'https://*.hotjar.io',
        "'unsafe-inline'",
    ],
    connectSrc: [
        'http://*.hotjar.com:*',
        'https://*.hotjar.com:*',
        'http://*.hotjar.io',
        'https://*.hotjar.io',
        'wss://*.hotjar.com',
    ],
    frameSrc: ['https://*.hotjar.com', 'http://*.hotjar.io', 'https://*.hotjar.io'],
    fontSrc: ['http://*.hotjar.com', 'https://*.hotjar.com', 'http://*.hotjar.io', 'https://*.hotjar.io'],
};

export default async function startServer() {
    const app = express();
    logger.info(`Using log level: ${Config.server.logLevel}`);

    app.use(httpLogger);

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.set('views', Config.server.frontendDir);
    app.set('view engine', '.html');

    app.use(redirectMiddleware);

    app.use(
        helmet({
            contentSecurityPolicy: Config.isDev
                ? {
                      directives: {
                          defaultSrc: ["'self'", 'data:'],
                          imgSrc: ["'self'", 'data:', ...hotjarCsp.imgSrc],
                          scriptSrc: ["'self'", ...hotjarCsp.scriptSrc],
                          styleSrc: ["'self'", 'fonts.googleapis.com', 'data: ', "'unsafe-inline'"],
                          connectSrc: [
                              "'self'",
                              'su-se-bakover.dev.adeo.no',
                              'su-se-bakover.nais.adeo.no',
                              ...hotjarCsp.connectSrc,
                          ],
                          frameSrc: [...hotjarCsp.frameSrc],
                          fontSrc: ["'self'", 'fonts.gstatic.com', 'data:', ...hotjarCsp.fontSrc],
                      },
                  }
                : false,
        }),
    );
    app.use(
        cors({
            origin: Config.server.host,
            allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'X-Requested-With'],
        }),
    );

    app.use(compression());
    const authClient = await AuthUtils.getOpenIdClient(Config.auth.discoverUrl);
    await setupAuth(app, authClient);

    app.use(setupProxy(authClient));

    app.use(await routes());

    const port = Config.server.port;
    app.listen(port, () => {
        logger.info(`Listening on http://:${port}`);
    });
}
