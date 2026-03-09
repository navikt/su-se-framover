import express from 'express';
import expressHttpProxy from 'express-http-proxy';
import * as OpenIdClient from 'openid-client';
import { Logger } from 'pino';

import * as AuthUtils from './auth/utils.js';
import * as Config from './config.js';

function isTokenRefreshOrOboError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
        return false;
    }

    const openIdError = error as { error?: string; error_description?: string; message?: string };

    return (
        openIdError.error === 'invalid_grant' ||
        openIdError.error_description?.includes('AADSTS500133') === true ||
        openIdError.message?.includes('AADSTS500133') === true
    );
}

export default function setup(authClient: OpenIdClient.Client) {
    const router = express.Router();

    const proxy = (log: Logger, accessToken?: string) =>
        expressHttpProxy(Config.server.suSeBakoverUrl, {
            parseReqBody: false,
            proxyReqOptDecorator: async (options) => {
                if (!accessToken) {
                    return options;
                }
                if (!options.headers) {
                    options.headers = {};
                }
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
    router.use('/api', (req, res, next) => {
        const user = req.user;
        if (!user) {
            req.log.debug('Missing user in route, waiting for middleware authentication');
            res.status(401)
                .header('WWW-Authenticate', 'OAuth realm=su-se-framover, charset="UTF-8"')
                .send('Not authenticated');
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
                if (isTokenRefreshOrOboError(error)) {
                    req.log.warn({ error }, 'Failed to refresh token(s) or request OBO token, returning 401.');
                    res.status(401)
                        .header('WWW-Authenticate', 'OAuth realm=su-se-framover, charset="UTF-8"')
                        .send('Not authenticated');
                    return;
                }

                req.log.error({ error }, 'Failed to renew token(s).');
                res.status(500).send('Failed to fetch/refresh access tokens on behalf of user');
            });
    });

    return router;
}
