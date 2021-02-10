import express from 'express';
import expressHttpProxy from 'express-http-proxy';
import * as OpenIdClient from 'openid-client';
import pino from 'pino';

import * as AuthUtils from './auth/utils';
import * as Config from './config';

export default function setup(authClient: OpenIdClient.Client) {
    const router = express.Router();

    const proxy = (log: pino.Logger, accessToken?: string) =>
        expressHttpProxy(Config.server.suSeBakoverUrl, {
            parseReqBody: false,
            proxyReqOptDecorator: async (options) => {
                if (!accessToken) {
                    return options;
                }
                if (!options.headers) {
                    options.headers = {};
                }
                options.headers['Authorization'] = `Bearer ${accessToken}`;
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
    router.use('/api', (req, res, next) => {
        if (req.url.endsWith('/toggles')) {
            req.log.debug('Skipping auth header for /toggles endpoint');
            return proxy(req.log)(req, res, next);
        }
        const user = req.user;
        if (!user) {
            req.log.debug('Missing user in route, waiting for middleware authentication');
            res.status(401).send('Not authenticated');
            return;
        }

        AuthUtils.getOrRefreshOnBehalfOfToken(authClient, user.tokenSets, req.log)
            .then((onBehalfOfToken) => {
                if (!onBehalfOfToken.access_token) {
                    res.status(500).send('Failed to fetch access token on behalf of user.');
                    req.log.error('proxyReqOptDecorator: Got on-behalf-of token, but the access_token was undefined');
                    return;
                }
                return proxy(req.log, onBehalfOfToken.access_token)(req, res, next);
            })
            .catch((error) => {
                req.log.error('Failed to refresh tokens', error);
                res.status(500).send('Failed to fetch/refresh access tokens on behalf of user');
            });
    });

    return router;
}
