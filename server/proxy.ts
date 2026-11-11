import express from 'express';
import expressHttpProxy from 'express-http-proxy';
import { AUTH_ERROR_CODE, authenticateUser, getToken, LOGIN_REQUIRED_HEADER } from './auth/index.js';
import { requestOboToken } from './auth/obo.js';
import * as Config from './config.js';
import { proxyErrorHandler } from './errorHandler.js';

// OBO-token veksles til su-se-bakover sin audience. På Azure har scope formatet api://<cluster>.<namespace>.<app>/.default.
const suSeBakoverScope = `api://${Config.auth.suSeBakoverUri}/.default`;

export default function setup() {
    const router = express.Router();

    const proxy = (accessToken: string) =>
        expressHttpProxy(Config.server.suSeBakoverUrl, {
            parseReqBody: false,
            proxyReqOptDecorator: async (options) => {
                options.headers = {
                    ...options.headers,
                    authorization: `Bearer ${accessToken}`,
                };
                return options;
            },
            proxyErrorHandler,
        });

    router.use('/api', authenticateUser, async (req, res, next) => {
        // authenticateUser har allerede validert at token finnes og er gyldig.
        const token = getToken(req)!;

        const obo = await requestOboToken(token, suSeBakoverScope, req.log);
        if (!obo.ok) {
            if (obo.reason === 'invalid_grant') {
                // Assertion-spesifikk avvisning (utløpt/ugyldig token) -> BFF-auth-utfordring:
                // 401 + header slik at frontend redirecter til ny innlogging. Merk: consent/
                // Conditional Access/claims-challenge klassifiseres IKKE som invalid_grant (de
                // ville loopet), men som upstream_error nedenfor.
                req.log.warn('proxy: OBO-veksling avvist (invalid_grant), returnerer 401.');
                res.setHeader(LOGIN_REQUIRED_HEADER, 'true');
                res.status(401).send('Not authenticated');
                return;
            }
            // Operasjonell feil (nettverk/timeout/5xx/feilkonfig) -> 502, IKKE 401, for å unngå
            // at en forbigående Azure-feil ser ut som utløpt innlogging og trigger re-login-loop.
            req.log.error('proxy: OBO-veksling feilet (upstream_error), returnerer 502.');
            res.status(502).json({ code: AUTH_ERROR_CODE, message: 'Kunne ikke hente on-behalf-of-token fra Azure' });
            return;
        }

        return proxy(obo.accessToken)(req, res, next);
    });

    return router;
}
