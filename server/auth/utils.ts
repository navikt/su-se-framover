import { HttpsProxyAgent } from 'https-proxy-agent';
import * as OpenIdClient from 'openid-client';
import { TokenSet } from 'openid-client';
import { Logger } from 'pino';

import * as Config from '../config';
import { logger } from '../logger';

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
    log: Logger
): Promise<TokenSet> {
    const selfToken = getTokenSetById(tokenSets, tokenSetSelfId);
    if (!selfToken) {
        throw Error(
            'getOrRefreshOnBehalfOfToken: Missing self-token in tokenSets. This should have been set by the middleware.'
        );
    }
    const onBehalfOfToken = getTokenSetById(tokenSets, Config.auth.suSeBakoverClientId);
    if (!onBehalfOfToken) {
        log.debug('getOrRefreshOnBehalfOfToken: creating missing on-behalf-of token.');
        const token = await getOrRefreshSelfTokenIfExpired(authClient, selfToken, tokenSets, log);
        const newOnBehalfOftoken = await requestOnBehalfOfToken(authClient, token);
        tokenSets[Config.auth.suSeBakoverClientId] = newOnBehalfOftoken;
        return newOnBehalfOftoken;
    }
    if (onBehalfOfToken.expired()) {
        log.debug('getOrRefreshOnBehalfOfToken: on-behalf-of token has expired, requesting new using refresh_token.');
        const refreshedOnBehalfOfToken = await (async () => {
            if (onBehalfOfToken.refresh_token) {
                return await authClient.refresh(onBehalfOfToken);
            } else {
                log.error(
                    'Dev only: Requesting new on-behalf-of token instead of refreshing it. The current auth mock does not support on-behalf-of with refresh_token.'
                );
                const token = await getOrRefreshSelfTokenIfExpired(authClient, selfToken, tokenSets, log);
                return await requestOnBehalfOfToken(authClient, token);
            }
        })();
        tokenSets[Config.auth.suSeBakoverClientId] = refreshedOnBehalfOfToken;
        return refreshedOnBehalfOfToken;
    }

    log.debug('getOrRefreshOnBehalfOfToken: using cached on-behalf-of token');
    return tokenSets[Config.auth.suSeBakoverClientId];
}

async function getOrRefreshSelfTokenIfExpired(
    authClient: OpenIdClient.Client,
    selfToken: TokenSet,
    tokenSets: TokenSets,
    log: Logger
): Promise<TokenSet> {
    if (selfToken.expired()) {
        // Dette vil i praksis ikke forekomme. Da middlewaren akkurat har hentet et nytt self token med 1 times varighet.
        log.debug('getOrRefreshOnBehalfOfToken: self token has expired, requesting new using refresh_token.');
        const refreshedSelfToken = await authClient.refresh(selfToken);
        tokenSets[tokenSetSelfId] = refreshedSelfToken;
        return refreshedSelfToken;
    }
    return selfToken;
}

async function requestOnBehalfOfToken(authClient: OpenIdClient.Client, tokenSet: TokenSet): Promise<TokenSet> {
    if (!tokenSet.access_token) {
        throw Error('Could not get on-behalf-of token because the access_token was undefined');
    }
    const grantBody: OpenIdClient.GrantBody = {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        requested_token_use: 'on_behalf_of',
        // oauth2-mock-server vil sette hva enn vi sender inn som scope her som audience i tokenet
        // mens AAD vil sette klient-ID-en som audience.
        // Vi trikser det derfor til her heller enn at su-se-bakover må ha noe spesialhåndtering
        scope:
            `offline_access ` + Config.isDev
                ? Config.auth.suSeBakoverClientId
                : `${Config.auth.suSeBakoverClientId}/.default`,
        assertion: tokenSet.access_token,
    };
    return await authClient.grant(grantBody);
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
        logger.error('Could not discover issuer', issuerUrl);
        throw e;
    }
}
