import express from 'express';

import * as Config from './config.js';

async function setup() {
    const router = express.Router();

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
        router.use(express.static(Config.server.frontendDir));

        router.get('/{*splat}', (_req, res) => {
            res.sendFile(Config.server.frontendDir + '/index.html');
        });
    }

    return router;
}

export default setup;
