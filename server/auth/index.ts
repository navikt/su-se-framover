import { NextFunction, Request, Response } from 'express';
import { createRemoteJWKSet, errors, jwtVerify } from 'jose';

import * as Config from '../config.js';

// Header som markerer at 401-svaret er BFF-ens EGEN autentiseringsutfordring (utløpt/ugyldig
// Wonderwall-session), i motsetning til en 401 som su-se-bakover returnerer transparent gjennom
// proxyen. Frontend gater login-redirecten på denne, slik at en backend-401 ikke gir re-login-loop.
// MERK: samme streng må brukes i frontend (src/api/authUrl.ts -> LOGIN_REQUIRED_HEADER).
export const LOGIN_REQUIRED_HEADER = 'x-login-required';

// Resultat av token-validering. Vi skiller bevisst auth-feil fra driftsfeil:
// - `invalid`: tokenet er ugyldig (feil signatur, utløpt, feil issuer/audience) -> 401.
// - `verification_error`: JWKS-en kunne ikke hentes (timeout/nettverk mot Azure) -> 5xx.
//   Å svare 401 her ville fått en JWKS-/Azure-nedetid til å se ut som utløpt innlogging og
//   startet en meningsløs Wonderwall-login-loop.
export type TokenValidationResult =
    | { ok: true }
    | { ok: false; reason: 'invalid' | 'verification_error'; code?: string; message: string };

// jose-feilkoder som betyr at selve tokenet er ugyldig (i motsetning til at vi ikke klarte
// å verifisere det pga. manglende nøkler/nettverk).
const INVALID_TOKEN_CODES = new Set<string>([
    'ERR_JWT_EXPIRED',
    'ERR_JWT_CLAIM_VALIDATION_FAILED',
    'ERR_JWS_SIGNATURE_VERIFICATION_FAILED',
    'ERR_JWS_INVALID',
    'ERR_JWT_INVALID',
    'ERR_JWKS_NO_MATCHING_KEY',
]);

// JWKS caches internt i jose, så vi oppretter settet én gang.
let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;
function getJwks() {
    if (!jwks) {
        jwks = createRemoteJWKSet(new URL(Config.auth.jwksUri));
    }
    return jwks;
}

// Henter bearer-token fra Authorization-headeren som Wonderwall legger på.
export function getToken(req: Request): string | undefined {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
        return undefined;
    }
    return authorization.substring('Bearer '.length);
}

// Validerer signatur, issuer, audience og utløp på tokenet fra Wonderwall.
// Wonderwall legger tokenet på headeren, men validerer det ikke selv – det er appens ansvar.
export async function validateToken(token: string): Promise<TokenValidationResult> {
    try {
        await jwtVerify(token, getJwks(), {
            issuer: Config.auth.issuer,
            audience: Config.auth.clientId,
        });
        return { ok: true };
    } catch (error) {
        const code = error instanceof errors.JOSEError ? error.code : undefined;
        const message = error instanceof Error ? error.message : String(error);
        if (code && INVALID_TOKEN_CODES.has(code)) {
            return { ok: false, reason: 'invalid', code, message };
        }
        // Ukjent/JWKS-/nettverksfeil -> vi klarte ikke å verifisere tokenet, ikke at det er ugyldig.
        return { ok: false, reason: 'verification_error', code, message };
    }
}

export async function authenticateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = getToken(req);
    if (!token) {
        req.log.debug('authenticateUser: Mangler bearer-token fra Wonderwall.');
        res.setHeader(LOGIN_REQUIRED_HEADER, 'true');
        res.status(401).send('Not authenticated');
        return;
    }

    const result = await validateToken(token);
    if (!result.ok) {
        if (result.reason === 'verification_error') {
            // Kunne ikke verifisere tokenet (JWKS/Azure utilgjengelig) -> 502, IKKE 401, for å
            // unngå at en forbigående nedetid trigger en meningsløs re-login-loop.
            req.log.error(
                { code: result.code, error: result.message },
                'authenticateUser: Klarte ikke å verifisere token (JWKS/nettverksfeil), returnerer 502.',
            );
            res.status(502).send('Kunne ikke verifisere token');
            return;
        }
        req.log.warn({ code: result.code, error: result.message }, 'authenticateUser: Token er ugyldig.');
        res.setHeader(LOGIN_REQUIRED_HEADER, 'true');
        res.status(401).send('Not authenticated');
        return;
    }

    next();
}
