import express from 'express';
import expressHttpProxy from 'express-http-proxy';
import { Logger } from 'pino';

import { authenticateUser, getToken } from './auth/index.js';
import { requestOboToken } from './auth/obo.js';
import * as Config from './config.js';

// OBO-token veksles til su-se-bakover sin audience. På Azure har scope formatet api://<cluster>.<namespace>.<app>/.default.
const suSeBakoverScope = `api://${Config.auth.suSeBakoverUri}/.default`;

export default function setup() {
    const router = express.Router();

    const proxy = (log: Logger, accessToken: string) =>
        expressHttpProxy(Config.server.suSeBakoverUrl, {
            parseReqBody: false,
            proxyReqOptDecorator: async (options) => {
                options.headers = {
                    ...options.headers,
                    authorization: `Bearer ${accessToken}`,
                };
                return options;
            },
            proxyErrorHandler: (err, res, next) => {
                if (err && err.code === 'ECONNREFUSED') {
                    log.error('proxyErrorHandler: Got ECONNREFUSED from su-se-bakover');
                    return res.status(503).send({ message: 'Could not contact su-se-bakover' });
                }
                next(err);
            },
        });

    router.use('/api', authenticateUser, async (req, res, next) => {
        // authenticateUser har allerede validert at token finnes og er gyldig.
        const token = getToken(req)!;

        const oboToken = await requestOboToken(token, suSeBakoverScope, req.log);
        if (!oboToken) {
            req.log.warn('proxy: Klarte ikke å hente on-behalf-of-token, returnerer 401.');
            res.status(401).send('Not authenticated');
            return;
        }

        return proxy(req.log, oboToken)(req, res, next);
    });

    return router;
}
