import compression from 'compression';
import cors from 'cors';
import express from 'express';

import setupAuth from './auth/index.js';
import * as AuthUtils from './auth/utils.js';
import * as Config from './config.js';
import { httpLogger, logger } from './logger.js';
import setupProxy from './proxy.js';
import redirectMiddleware from './redirect.js';
import routes from './routes.js';

export default async function expressStart() {
    const app = express();
    logger.info(`Using log level: ${Config.server.logLevel}`);

    app.use(httpLogger);

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.set('views', Config.server.frontendDir);
    app.set('view engine', '.html');

    app.use(redirectMiddleware);

    app.use(
        cors({
            origin: Config.server.host,
            allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'X-Requested-With'],
        }),
    );

    app.use(compression());
    const authConfig = await AuthUtils.getOpenIdClient(Config.auth.discoverUrl);
    await setupAuth(app, authConfig);

    app.use(setupProxy(authConfig));

    app.use(await routes());

    const port = Config.server.port;
    app.listen(port, () => {
        logger.info(`Listening on http://:${port}`);
    });
}
