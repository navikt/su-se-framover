import { Parcel } from '@parcel/core';
import express from 'express';

import * as Config from './config';
import { logger } from './logger';

function setup() {
    const router = express.Router();

    router.get('/isAlive', (_req, res) => {
        res.send('ALIVE');
    });

    router.get('/isReady', (_req, res) => {
        res.send('READY');
    });
    if (Config.isDev) {
        const bundler = new Parcel({
            entries: './src/index.html',
            defaultConfig: '@parcel/config-default',
            shouldAutoInstall: false,
            shouldDisableCache: true,
            logLevel: 'verbose',
            env: process.env,
            serveOptions: {
                port: 1234,
            },
            defaultTargetOptions: {
                shouldScopeHoist: false,
                shouldOptimize: false,
                sourceMaps: true,
                isLibrary: false,
                engines: {
                    browsers: ['> 0.5%, last 2 versions, not dead'],
                },
            },
        });
        bundler.watch((err, event) => {
            if (err) {
                // fatal error
                throw err;
            }
            if (event && event.type === 'buildSuccess') {
                const bundles = event.bundleGraph.getBundles();
                logger.info(`✨ Built ${bundles.length} bundles in ${event.buildTime}ms!`);
            } else if (event && event.type === 'buildFailure') {
                logger.info(event.diagnostics);
            }
        });
    } else {
        router.use(
            express.static(Config.server.frontendDir, {
                index: false,
            })
        );
        router.get('*', (_req, res) => {
            res.render('index.html', {
                CONFIG: JSON.stringify(Config.client),
                CSP_NONCE: (res as any).locals.cspNonce,
                layout: false,
            });
        });
    }

    return router;
}

export default setup;
