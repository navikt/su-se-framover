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

    router.use(express.static(Config.server.frontendDir));

    router.get('*', (_req, res) => {
        res.sendFile(Config.server.frontendDir + '/index.html');
    });

    return router;
}

export default setup;
