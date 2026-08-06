import { NextFunction, Request, Response } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';

import * as Config from '../config.js';

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
export async function validateToken(token: string): Promise<boolean> {
    try {
        await jwtVerify(token, getJwks(), {
            issuer: Config.auth.issuer,
            audience: Config.auth.clientId,
        });
        return true;
    } catch {
        return false;
    }
}

export async function authenticateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = getToken(req);
    if (!token) {
        req.log.debug('authenticateUser: Mangler bearer-token fra Wonderwall.');
        res.status(401).send('Not authenticated');
        return;
    }

    if (!(await validateToken(token))) {
        req.log.warn('authenticateUser: Token er ugyldig.');
        res.status(401).send('Not authenticated');
        return;
    }

    next();
}
