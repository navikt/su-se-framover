import { NextFunction, Request, Response } from 'express';
import * as OpenIdClient from 'openid-client';

import * as Config from '../config';

export const tokenSetSelfId = 'self';

function getTokenSetsFromSession(req: Request) {
    return req.user?.tokenSets ?? null;
}

function hasValidAccessToken(req: Request) {
    const tokenSets = getTokenSetsFromSession(req);
    if (!tokenSets) {
        return false;
    }
    const tokenSet = tokenSets.self;
    if (!tokenSet) {
        return false;
    }
    return new OpenIdClient.TokenSet(tokenSet).expired() === false;
}

export async function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated() && hasValidAccessToken(req)) {
        next();
    } else {
        req.session.redirectTo = req.url;
        res.redirect('/login');
    }
}

export async function getOpenIdClient(issuerUrl: string) {
    try {
        const issuer = await OpenIdClient.Issuer.discover(issuerUrl);

        return new issuer.Client(
            {
                client_id: Config.auth.clientId,
                redirect_uris: [Config.auth.redirectUri],
                token_endpoint_auth_method: 'private_key_jwt',
                token_endpoint_auth_signing_alg: 'RS256',
            },
            Config.auth.jwks
        );
    } catch (e) {
        console.log('klarte ikke oppdage issuer', issuerUrl);
        throw e;
    }
}
