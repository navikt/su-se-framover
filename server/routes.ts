import express from 'express';

import * as Config from './config.js';
import { logger } from './logger.js';

interface UmamiConfig {
    scriptUrl: string;
    websiteId: string;
}

interface FrontendConfig {
    environment: string;
    cachebuster: string;
    umami?: UmamiConfig;
}

async function setup() {
    const router = express.Router();

    router.get('/frontend-config', (_req, res) => {
        const umami = Config.frontend.umami;
        const umamiConfig =
            umami.scriptUrl && umami.websiteId
                ? {
                      scriptUrl: umami.scriptUrl,
                      websiteId: umami.websiteId,
                  }
                : undefined;

        const response: FrontendConfig = {
            environment: Config.frontend.environment,
            cachebuster: Config.frontend.cachebuster,
            umami: umamiConfig,
        };

        res.set('Cache-Control', 'no-store');
        res.json(response);
    });

    router.get('/isAlive', (_req, res) => {
        res.send('ALIVE');
    });

    router.get('/isReady', (_req, res) => {
        res.send('READY');
    });

    if (Config.isDev) {
        //TODO: heller ha denne configen her?
        console.log('Setting up local development version');
        const server = await import('vite');
        const createServer = await server.createServer({
            configFile: 'vite.config.ts',
        });
        await createServer.listen();
    } else {
        router.use(
            express.static(Config.server.frontendDir, {
                setHeaders: (res, filePath) => {
                    if (filePath.endsWith('index.html')) {
                        res.setHeader('Cache-Control', 'no-store');
                    }
                },
            }),
        );

        router.get('/assets/{*splat}', (req, res) => {
            logger.error(
                {
                    url: req.originalUrl,
                    referer: req.headers.referer,
                    fetchDest: req.headers['sec-fetch-dest'],
                },
                'Etterspurt asset finnes ikke. Klienten har sannsynligvis cachet en gammel index.html som refererer til assets fra et tidligere bygg.',
            );
            res.sendStatus(404);
        });

        router.get('/{*splat}', (_req, res) => {
            res.setHeader('Cache-Control', 'no-store');
            res.sendFile(Config.server.frontendDir + '/index.html');
        });
    }

    return router;
}

export default setup;
