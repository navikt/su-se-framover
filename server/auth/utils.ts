import { NextFunction, Request, Response } from 'express';
import { HttpsProxyAgent } from 'https-proxy-agent';
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

export async function getOnBehalfOfAccessToken(authClient: OpenIdClient.Client, req: Request) {
    if (!req.user) {
        return null;
    }
    const grantBody: OpenIdClient.GrantBody = {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        requested_token_use: 'on_behalf_of',
        // oauth2-mock-server vil sette hva enn vi sender inn som scope her som audience i tokenet
        // mens AAD vil sette klient-ID-en som audience.
        // Vi trikser det derfor til her heller enn at su-se-bakover må ha noe spesialhåndtering
        scope: Config.isDev ? Config.auth.suSeBakoverClientId : `api://${Config.auth.suSeBakoverClientId}/.default`,
        assertion: req.user.tokenSets[tokenSetSelfId].access_token,
    };

    const tokenSet = await authClient.grant(grantBody);
    req.user.tokenSets[Config.auth.suSeBakoverClientId] = tokenSet;
    return tokenSet.access_token;
}

export async function getOpenIdClient(issuerUrl: string) {
    try {
        if (Config.server.proxy) {
            const proxyAgent = new HttpsProxyAgent(Config.server.proxy);
            OpenIdClient.custom.setHttpOptionsDefaults({
                agent: {
                    http: proxyAgent,
                    https: proxyAgent,
                },
            });
        }
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
