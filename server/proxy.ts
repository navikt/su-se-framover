import express from 'express';
import proxy from 'express-http-proxy';
import * as OpenIdClient from 'openid-client';

import * as AuthUtils from './auth/utils';
import * as Config from './config';

export default function setup(authClient: OpenIdClient.Client) {
    const router = express.Router();

    router.use(
        '/api',
        proxy(Config.server.suSeBakoverUrl, {
            parseReqBody: false,
            proxyReqOptDecorator: async (options, req) => {
                const accessToken = await AuthUtils.getOnBehalfOfAccessToken(authClient, req);
                if (!options.headers) {
                    options.headers = {};
                }
                options.headers['Authorization'] = `Bearer ${accessToken}`;
                return options;
            },
            proxyErrorHandler: (err, res, next) => {
                if (err && err.code === 'ECONNREFUSED') {
                    return res.status(500).send({ message: 'Could not contact su-se-bakover' });
                }
                next(err);
            },
        })
    );

    return router;
}
