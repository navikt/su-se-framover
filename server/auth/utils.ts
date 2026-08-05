import * as client from 'openid-client';
import { Logger } from 'pino';

import * as Config from '../config.js';
import { logger } from '../logger.js';
import { StoredToken, TokenSets } from '../typings/express/express.js';

export const tokenSetSelfId = 'self';
const TOKEN_REFRESH_MARGIN_SECONDS = 60;

export function withExpiresAt(token: client.TokenEndpointResponse): StoredToken {
    return {
        ...token,
        expires_at: token.expires_in ? Math.floor(Date.now() / 1000) + token.expires_in : undefined,
    };
}

function getTokenSetById(tokenSets: TokenSets, id: string): StoredToken | null {
    if (!(id in tokenSets)) {
        // Denne skal være initielt satt av passport
        return null;
    }
    return tokenSets[id];
}

function expiringSoon(token: StoredToken): boolean {
    if (!token.expires_at) return false;
    const remainingSeconds = token.expires_at - Math.floor(Date.now() / 1000);
    return remainingSeconds <= TOKEN_REFRESH_MARGIN_SECONDS;
}

export async function getOrRefreshOnBehalfOfToken(
    config: client.Configuration,
    tokenSets: TokenSets,
    log: Logger,
): Promise<StoredToken> {
    const tokenSet = getTokenSetById(tokenSets, tokenSetSelfId);
    if (!tokenSet) {
        throw Error(
            'getOrRefreshAccessTokenIfSoonExpired: Missing self-token in tokenSets. This should have been set by the middleware.',
        );
    }
    const onBehalfOfToken = getTokenSetById(tokenSets, Config.auth.suSeBakoverUri);
    if (!onBehalfOfToken) {
        log.debug('getOrRefreshAccessTokenIfSoonExpired: creating missing on-behalf-of token.');
        const token = await getOrRefreshAccessTokenIfSoonExpired(config, tokenSet, tokenSets, log);
        const newOnBehalfOftoken = await requestOnBehalfOfToken(config, token);
        tokenSets[Config.auth.suSeBakoverUri] = newOnBehalfOftoken;
        return newOnBehalfOftoken;
    }
    if (expiringSoon(onBehalfOfToken)) {
        log.debug(
            'getOrRefreshAccessTokenIfSoonExpired: on-behalf-of token is expiring soon, requesting new using refresh_token.',
        );
        const token = await getOrRefreshAccessTokenIfSoonExpired(config, tokenSet, tokenSets, log);
        const refreshedOnBehalfOfToken = await requestOnBehalfOfToken(config, token);
        tokenSets[Config.auth.suSeBakoverUri] = refreshedOnBehalfOfToken;
        return refreshedOnBehalfOfToken;
    }
    return tokenSets[Config.auth.suSeBakoverUri];
}

async function getOrRefreshAccessTokenIfSoonExpired(
    config: client.Configuration,
    tokenSet: StoredToken,
    tokenSets: TokenSets,
    log: Logger,
): Promise<StoredToken> {
    if (expiringSoon(tokenSet)) {
        // Denne vil ikke bli kalt initielt, men først når OBO/self-token må fornyes
        log.debug('getOrRefreshOnBehalfOfToken: self token is expiring soon, requesting new using refresh_token.');
        if (!tokenSet.refresh_token) {
            throw Error('Cannot refresh access token: missing refresh_token');
        }
        const nyttTokenSet = withExpiresAt(await client.refreshTokenGrant(config, tokenSet.refresh_token));
        tokenSets[tokenSetSelfId] = nyttTokenSet;
        return nyttTokenSet;
    }
    return tokenSet;
}

async function requestOnBehalfOfToken(config: client.Configuration, tokenSet: StoredToken): Promise<StoredToken> {
    if (!tokenSet.access_token) {
        throw Error('Could not get on-behalf-of token because the access_token was undefined');
    }
    const response = await client.genericGrantRequest(config, 'urn:ietf:params:oauth:grant-type:jwt-bearer', {
        // oauth2-mock-server vil sette hva enn vi sender inn som scope her som audience i tokenet
        // mens AAD vil sette klient-ID-en som audience.
        // Vi trikser det derfor til her heller enn at su-se-bakover må ha noe spesialhåndtering
        requested_token_use: 'on_behalf_of',
        scope: `api://${Config.auth.suSeBakoverUri}/.default`,
        assertion: tokenSet.access_token,
    });
    return withExpiresAt(response);
}

export async function getOpenIdClient(issuerUrl: string): Promise<client.Configuration> {
    try {
        const jwk = Config.auth.jwks.keys[0];
        const privateKey = await crypto.subtle.importKey(
            'jwk',
            jwk,
            { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
            false,
            ['sign'],
        );
        return await client.discovery(
            new URL(issuerUrl),
            Config.auth.clientId,
            {
                redirect_uris: [Config.auth.loginRedirectUri],
            },
            client.PrivateKeyJwt({ key: privateKey, kid: jwk.kid }),
        );
    } catch (e) {
        logger.error(`Could not discover issuer: ${issuerUrl}`);
        throw e;
    }
}
