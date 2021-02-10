import { HttpsProxyAgent } from 'https-proxy-agent';
import * as OpenIdClient from 'openid-client';
import { TokenSet } from 'openid-client';
import pino from 'pino';

import * as Config from '../config';

import { TokenSets } from './index';

export const tokenSetSelfId = 'self';

function getTokenSetById(tokenSets: TokenSets, id: string): TokenSet | null {
    if (!(id in tokenSets)) {
        // Denne skal være initielt satt av passport
        return null;
    }
    if (tokenSets[id] instanceof OpenIdClient.TokenSet) {
        return tokenSets[id];
    }
    // Denne kan være et object (f.eks. hvis den er hentet fra redis)
    return new OpenIdClient.TokenSet(tokenSets[id]);
}

export async function getOrRefreshOnBehalfOfToken(
    authClient: OpenIdClient.Client,
    tokenSets: TokenSets,
    log: pino.Logger
): Promise<TokenSet> {
    const selfTokenSet = getTokenSetById(tokenSets, tokenSetSelfId);
    if (!selfTokenSet) {
        throw Error('Mangler self-token i tokenSets');
    }
    if (selfTokenSet.expired()) {
        log.debug('getOrRefreshOnBehalfOfToken: self token has expired, refreshing all tokens.');
        const refreshedSelfTokenSet = await refreshSelfTokenSet(authClient, selfTokenSet);
        tokenSets[tokenSetSelfId] = refreshedSelfTokenSet;
        const newOnBehalfOftoken = await fetchOnBehalfOfToken(authClient, refreshedSelfTokenSet);
        tokenSets[Config.auth.suSeBakoverClientId] = newOnBehalfOftoken;
        return newOnBehalfOftoken;
    }
    const onBehalfOfToken = getTokenSetById(tokenSets, Config.auth.suSeBakoverClientId);
    if (!onBehalfOfToken) {
        log.debug('getOrRefreshOnBehalfOfToken: on-behalf-of token is missing, creating.');
        const newOnBehalfOftoken = await fetchOnBehalfOfToken(authClient, selfTokenSet);
        tokenSets[Config.auth.suSeBakoverClientId] = newOnBehalfOftoken;
        return newOnBehalfOftoken;
    }
    if (onBehalfOfToken.expired()) {
        log.debug('getOrRefreshOnBehalfOfToken: on-behalf-of token has expired, re-creating.');
        const newOnBehalfOftoken = await fetchOnBehalfOfToken(authClient, selfTokenSet);
        tokenSets[Config.auth.suSeBakoverClientId] = newOnBehalfOftoken;
        return newOnBehalfOftoken;
    }
    log.debug('getOrRefreshOnBehalfOfToken: using cached on-behalf-of token');
    return tokenSets[Config.auth.suSeBakoverClientId];
}

async function fetchOnBehalfOfToken(authClient: OpenIdClient.Client, tokenSet2: TokenSet): Promise<TokenSet> {
    if (!tokenSet2.access_token) {
        return Promise.reject('Could not get on-behalf-of token because the access_token was undefined');
    }
    const grantBody: OpenIdClient.GrantBody = {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        requested_token_use: 'on_behalf_of',
        // oauth2-mock-server vil sette hva enn vi sender inn som scope her som audience i tokenet
        // mens AAD vil sette klient-ID-en som audience.
        // Vi trikser det derfor til her heller enn at su-se-bakover må ha noe spesialhåndtering
        scope: Config.isDev ? Config.auth.suSeBakoverClientId : `api://${Config.auth.suSeBakoverClientId}/.default`,
        assertion: tokenSet2.access_token,
    };
    return await authClient.grant(grantBody);
}

async function refreshSelfTokenSet(authClient: OpenIdClient.Client, tokenSet: TokenSet): Promise<TokenSet> {
    return await authClient.refresh(tokenSet);
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
        console.error('klarte ikke oppdage issuer', issuerUrl);
        throw e;
    }
}
