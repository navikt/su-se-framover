import express from 'express';
import Bundler from 'parcel-bundler';

import * as Config from './config';

function parcelBundlerMiddleware() {
    const bundler = new Bundler('src/index.html', {});
    return bundler.middleware();
}

function setup() {
    const router = express.Router();

    router.get('/isAlive', (_req, res) => {
        res.send('ALIVE');
    });

    router.get('/isReady', (_req, res) => {
        res.send('READY');
    });

    if (Config.server.isDev) {
        router.use(parcelBundlerMiddleware());
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
