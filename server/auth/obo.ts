import { decodeJwt } from 'jose';
import { Logger } from 'pino';

import * as Config from '../config.js';

type OnBehalfOfTokenResponse = {
    token_type: string;
    expires_in: number;
    access_token: string;
};

type CachedToken = {
    accessToken: string;
    // Unix-tid (ms) da tokenet regnes som utløpt (med margin).
    expiresAt: number;
};

// Vi fornyer tokenet litt før faktisk utløp for å unngå å bruke et token som utløper midt i en request.
const EXPIRY_MARGIN_MS = 30_000;

// Cache av OBO-tokens per (bruker, scope). Uten dette veksles et nytt token mot
// token-endpointet for hver eneste /api-request, som gir unødig latency og last.
const cache = new Map<string, CachedToken>();

// Nøkkel per bruker (sub) og scope. Faller tilbake til hele assertion-tokenet dersom sub mangler.
function cacheKey(assertion: string, scope: string): string {
    let sub: string | undefined;
    try {
        sub = decodeJwt(assertion).sub;
    } catch {
        sub = undefined;
    }
    return `${sub ?? assertion}:${scope}`;
}

async function fetchOboToken(assertion: string, scope: string, log: Logger): Promise<string | undefined> {
    const body = new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        client_id: Config.auth.clientId,
        client_secret: Config.auth.clientSecret,
        assertion,
        scope,
        requested_token_use: 'on_behalf_of',
    });

    let response: Response;
    try {
        response = await fetch(Config.auth.tokenEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            body: body.toString(),
        });
    } catch (error) {
        log.error({ error }, 'requestOboToken: Nettverksfeil ved OBO-veksling mot token-endpoint.');
        return undefined;
    }

    if (!response.ok) {
        log.warn({ status: response.status, error: await response.text() }, 'requestOboToken: OBO-veksling feilet.');
        return undefined;
    }

    let token: OnBehalfOfTokenResponse;
    try {
        token = (await response.json()) as OnBehalfOfTokenResponse;
    } catch (error) {
        log.error({ error }, 'requestOboToken: Klarte ikke å parse svaret fra token-endpoint.');
        return undefined;
    }

    if (!token.access_token) {
        log.error('requestOboToken: Svaret fra token-endpoint manglet access_token.');
        return undefined;
    }

    cache.set(cacheKey(assertion, scope), {
        accessToken: token.access_token,
        expiresAt: Date.now() + token.expires_in * 1000 - EXPIRY_MARGIN_MS,
    });

    return token.access_token;
}

// Veksler brukerens token til et on-behalf-of-token for su-se-bakover ved å kalle
// Azure sitt token-endpoint direkte (grant jwt-bearer). I NAIS injiseres
// AZURE_APP_CLIENT_SECRET og AZURE_OPENID_CONFIG_TOKEN_ENDPOINT automatisk (azure.application).
// Tokens caches per bruker og scope til de er i ferd med å utløpe.
export async function requestOboToken(assertion: string, scope: string, log: Logger): Promise<string | undefined> {
    const cached = cache.get(cacheKey(assertion, scope));
    if (cached && Date.now() < cached.expiresAt) {
        return cached.accessToken;
    }

    return fetchOboToken(assertion, scope, log);
}
