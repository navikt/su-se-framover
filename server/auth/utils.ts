import type { JsonWebKey } from 'node:crypto';
import { webcrypto } from 'node:crypto';
import * as OpenIdClient from 'openid-client';
import { Logger } from 'pino';

import * as Config from '../config.js';
import { logger } from '../logger.js';
import type { NormalizedTokenSet, StoredTokenSet, TokenSets } from '../typings/express/express.js';

const TOKEN_EXPIRY_SKEW_MILLIS = 60 * 1000;
export const tokenSetSelfId = 'self';

function getTokenSetById(tokenSets: TokenSets, id: string): NormalizedTokenSet | null {
    if (!(id in tokenSets)) {
        // Denne skal være initielt satt av passport
        return null;
    }
    const tokenSet = tokenSets[id];
    if (typeof tokenSet.receivedAt !== 'number') {
        // Denne kan være et object (f.eks. hvis den er hentet fra redis)
        tokenSet.receivedAt = Date.now();
    }
    return tokenSet as NormalizedTokenSet;
}

export function toStoredTokenSet(
    tokenSet: OpenIdClient.TokenEndpointResponse,
    existingTokenSet?: StoredTokenSet,
): NormalizedTokenSet {
    return {
        ...existingTokenSet,
        ...tokenSet,
        refresh_token: tokenSet.refresh_token ?? existingTokenSet?.refresh_token,
        receivedAt: Date.now(),
    };
}

export function isTokenExpired(tokenSet: NormalizedTokenSet): boolean {
    if (!tokenSet.expires_in) {
        return false;
    }
    const expiresAt = tokenSet.receivedAt + tokenSet.expires_in * 1000;
    return Date.now() >= expiresAt - TOKEN_EXPIRY_SKEW_MILLIS;
}

export async function getOrRefreshOnBehalfOfToken(
    authConfig: OpenIdClient.Configuration,
    tokenSets: TokenSets,
    log: Logger,
): Promise<NormalizedTokenSet> {
    const selfToken = getTokenSetById(tokenSets, tokenSetSelfId);
    if (!selfToken) {
        throw Error(
            'getOrRefreshOnBehalfOfToken: Missing self-token in tokenSets. This should have been set by the middleware.',
        );
    }
    const onBehalfOfToken = getTokenSetById(tokenSets, Config.auth.suSeBakoverUri);
    if (!onBehalfOfToken) {
        log.debug('getOrRefreshOnBehalfOfToken: creating missing on-behalf-of token.');
        const token = await getOrRefreshSelfTokenIfExpired(authConfig, selfToken, tokenSets, log);
        const newOnBehalfOftoken = await requestOnBehalfOfToken(authConfig, token);
        tokenSets[Config.auth.suSeBakoverUri] = newOnBehalfOftoken;
        return newOnBehalfOftoken;
    }
    if (isTokenExpired(onBehalfOfToken)) {
        log.debug('getOrRefreshOnBehalfOfToken: on-behalf-of token has expired, requesting new using refresh_token.');
        const token = await getOrRefreshSelfTokenIfExpired(authConfig, selfToken, tokenSets, log);
        const refreshedOnBehalfOfToken = await requestOnBehalfOfToken(authConfig, token);
        tokenSets[Config.auth.suSeBakoverUri] = refreshedOnBehalfOfToken;
        return refreshedOnBehalfOfToken;
    }
    return tokenSets[Config.auth.suSeBakoverUri];
}

async function getOrRefreshSelfTokenIfExpired(
    authConfig: OpenIdClient.Configuration,
    selfToken: NormalizedTokenSet,
    tokenSets: TokenSets,
    log: Logger,
): Promise<NormalizedTokenSet> {
    if (isTokenExpired(selfToken)) {
        // Denne vil ikke bli kalt initielt, men først når OBO/self-token har expired
        log.debug('getOrRefreshOnBehalfOfToken: self token has expired, requesting new using refresh_token.');
        if (!selfToken.refresh_token) {
            throw Error('Missing refresh_token in self-token. Cannot refresh expired token.');
        }
        const refreshedSelfToken = await OpenIdClient.refreshTokenGrant(authConfig, selfToken.refresh_token);
        const storedToken = toStoredTokenSet(refreshedSelfToken, selfToken);
        tokenSets[tokenSetSelfId] = storedToken;
        return storedToken;
    }
    return selfToken;
}

async function requestOnBehalfOfToken(
    authConfig: OpenIdClient.Configuration,
    tokenSet: NormalizedTokenSet,
): Promise<NormalizedTokenSet> {
    if (!tokenSet.access_token) {
        throw Error('Could not get on-behalf-of token because the access_token was undefined');
    }
    const grantParams = {
        requested_token_use: 'on_behalf_of',
        // oauth2-mock-server vil sette hva enn vi sender inn som scope her som audience i tokenet
        // mens AAD vil sette klient-ID-en som audience.
        // Vi trikser det derfor til her heller enn at su-se-bakover må ha noe spesialhåndtering
        scope: `api://${Config.auth.suSeBakoverUri}/.default`,
        assertion: tokenSet.access_token,
    };
    const grantResponse = await OpenIdClient.genericGrantRequest(
        authConfig,
        'urn:ietf:params:oauth:grant-type:jwt-bearer',
        grantParams,
    );
    return toStoredTokenSet(grantResponse);
}

export async function getOpenIdClient(issuerUrl: string): Promise<OpenIdClient.Configuration> {
    try {
        const privateKeyJwk = Config.auth.jwks?.keys?.find((key: OpenIdClient.JWK) => key.kty === 'RSA' && 'd' in key);
        if (!privateKeyJwk) {
            throw Error('Missing private RSA key in JWKS config.');
        }
        const cryptoKey = await webcrypto.subtle.importKey(
            'jwk',
            privateKeyJwk as JsonWebKey,
            { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
            false,
            ['sign'],
        );
        const privateKey: OpenIdClient.PrivateKey = { key: cryptoKey, kid: privateKeyJwk.kid };
        const clientAuth = OpenIdClient.PrivateKeyJwt(privateKey);

        return await OpenIdClient.discovery(
            new URL(issuerUrl),
            Config.auth.clientId,
            {
                redirect_uris: [Config.auth.loginRedirectUri],
                token_endpoint_auth_method: Config.auth.tokenEndpointAuthMethod,
                token_endpoint_auth_signing_alg: Config.auth.tokenEndpointAuthSigningAlg,
            },
            clientAuth,
        );
    } catch (e) {
        logger.error(`Could not discover issuer: ${issuerUrl}`);
        throw e;
    }
}
