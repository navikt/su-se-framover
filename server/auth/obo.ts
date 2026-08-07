import { decodeJwt } from 'jose';
import { Logger } from 'pino';

import * as Config from '../config.js';

type OnBehalfOfTokenResponse = {
    token_type: string;
    expires_in: number;
    access_token: string;
};

// Resultat av en OBO-veksling. Vi skiller bevisst mellom auth-feil og driftsfeil:
// - `invalid_grant`: brukerens assertion (token fra Wonderwall) er ugyldig/utløpt. Kallet
//   bør svare 401 slik at frontend sender brukeren til ny innlogging.
// - `upstream_error`: operasjonell feil (nettverk, timeout, 5xx, feilkonfigurert klient,
//   uventet/malformed svar). Kallet bør svare 5xx – IKKE 401 – ellers ser en forbigående
//   Azure-feil ut som en utløpt innlogging og trigger unødige (potensielt endeløse) redirects.
export type OboResult =
    | { ok: true; accessToken: string }
    | { ok: false; reason: 'invalid_grant' }
    | { ok: false; reason: 'upstream_error' };

type CachedToken = {
    accessToken: string;
    // Unix-tid (ms) da tokenet regnes som utløpt (med margin).
    expiresAt: number;
};

// Vi fornyer tokenet litt før faktisk utløp for å unngå å bruke et token som utløper midt i en request.
const EXPIRY_MARGIN_MS = 30_000;

// Timeout mot token-endpointet, slik at en treg/hengende Azure ikke henger /api-requesten.
const TOKEN_REQUEST_TIMEOUT_MS = 5_000;

// Cache av OBO-tokens per (bruker, scope). Uten dette veksles et nytt token mot
// token-endpointet for hver eneste /api-request, som gir unødig latency og last.
const cache = new Map<string, CachedToken>();

// Dedupliserer samtidige vekslinger for samme nøkkel, slik at N parallelle requests med
// kald/utløpt cache ikke gir N samtidige kall mot token-endpointet ("thundering herd").
const inFlight = new Map<string, Promise<OboResult>>();

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

// Fjerner utløpte entries slik at cachen ikke vokser ubegrenset i en langlivet pod.
function pruneExpired(now: number): void {
    for (const [key, value] of cache) {
        if (now >= value.expiresAt) {
            cache.delete(key);
        }
    }
}

// Klassifiserer en ikke-ok respons fra token-endpointet. Kun et ekte OAuth `invalid_grant`
// (ugyldig/utløpt assertion) regnes som en auth-feil; alt annet (f.eks. `invalid_client`
// ved feil client_secret, eller 5xx) er operasjonelt og skal ikke gi 401.
function classifyErrorResponse(body: string): 'invalid_grant' | 'upstream_error' {
    try {
        const parsed = JSON.parse(body) as { error?: string };
        if (parsed.error === 'invalid_grant') {
            return 'invalid_grant';
        }
    } catch {
        // Ikke JSON -> behandles som operasjonell feil.
    }
    return 'upstream_error';
}

async function fetchOboToken(assertion: string, scope: string, key: string, log: Logger): Promise<OboResult> {
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
            signal: AbortSignal.timeout(TOKEN_REQUEST_TIMEOUT_MS),
        });
    } catch (error) {
        // Nettverksfeil eller timeout er operasjonelt, ikke en auth-feil.
        log.error({ error }, 'requestOboToken: Nettverksfeil/timeout ved OBO-veksling mot token-endpoint.');
        return { ok: false, reason: 'upstream_error' };
    }

    if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        const reason = classifyErrorResponse(errorBody);
        log.warn({ status: response.status, error: errorBody, reason }, 'requestOboToken: OBO-veksling feilet.');
        return { ok: false, reason };
    }

    let token: OnBehalfOfTokenResponse;
    try {
        token = (await response.json()) as OnBehalfOfTokenResponse;
    } catch (error) {
        // 200 men ugyldig kropp er en anomali fra endepunktet -> operasjonell feil.
        log.error({ error }, 'requestOboToken: Klarte ikke å parse svaret fra token-endpoint.');
        return { ok: false, reason: 'upstream_error' };
    }

    if (!token.access_token || typeof token.expires_in !== 'number') {
        // Uten gyldig expires_in ville cachen aldri slått til (NaN-utløp) -> operasjonell feil.
        log.error(
            { hasAccessToken: Boolean(token.access_token), expiresIn: token.expires_in },
            'requestOboToken: Svaret fra token-endpoint manglet access_token eller gyldig expires_in.',
        );
        return { ok: false, reason: 'upstream_error' };
    }

    cache.set(key, {
        accessToken: token.access_token,
        expiresAt: Date.now() + token.expires_in * 1000 - EXPIRY_MARGIN_MS,
    });

    return { ok: true, accessToken: token.access_token };
}

// Veksler brukerens token til et on-behalf-of-token for su-se-bakover ved å kalle
// Azure sitt token-endpoint direkte (grant jwt-bearer). I NAIS injiseres
// AZURE_APP_CLIENT_SECRET og AZURE_OPENID_CONFIG_TOKEN_ENDPOINT automatisk (azure.application).
// Tokens caches per bruker og scope til de er i ferd med å utløpe.
export async function requestOboToken(assertion: string, scope: string, log: Logger): Promise<OboResult> {
    const key = cacheKey(assertion, scope);
    const now = Date.now();

    const cached = cache.get(key);
    if (cached && now < cached.expiresAt) {
        return { ok: true, accessToken: cached.accessToken };
    }

    // Er en veksling for samme nøkkel allerede underveis, gjenbruk den i stedet for å starte en ny.
    const existing = inFlight.get(key);
    if (existing) {
        return existing;
    }

    pruneExpired(now);

    const promise = fetchOboToken(assertion, scope, key, log).finally(() => {
        inFlight.delete(key);
    });
    inFlight.set(key, promise);
    return promise;
}
