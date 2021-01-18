import { Express, NextFunction, Request, Response } from 'express';
import * as OpenIdClient from 'openid-client';
import passport from 'passport';

import * as Config from '../config';

declare module 'express-session' {
    interface SessionData {
        redirectTo?: string;
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface User {
            claims: OpenIdClient.IdTokenClaims[];
            tokenSets: {
                self: OpenIdClient.TokenSet;
            };
        }
    }
}

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

async function getOpenIdClient(issuerUrl: string) {
    const issuer = await OpenIdClient.Issuer.discover(issuerUrl);

    return new issuer.Client(
        {
            client_id: Config.auth.clientId,
            client_secret: Config.auth.clientSecret,
            redirect_uris: [Config.auth.redirectUri],
        },
        Config.server.isProd ? Config.auth.jwks : undefined
    );
}

async function getStrategy(issuerUrl: string) {
    const client = await getOpenIdClient(issuerUrl);

    return new OpenIdClient.Strategy(
        {
            client: client,
            params: {
                response_type: Config.auth.responseType,
                response_mode: Config.auth.responseMode,
                scope: `openid ${Config.auth.clientId}/.default`,
            },
        },
        (tokenSet: OpenIdClient.TokenSet, done: (err: unknown, user?: unknown) => void) => {
            if (tokenSet.expired()) {
                return done(null, false);
            }
            const user = {
                tokenSets: {
                    self: tokenSet,
                },
                claims: tokenSet.claims(),
            };
            done(null, user);
        }
    );
}

export default async function setup(app: Express, discoverUrl: string) {
    app.use(passport.initialize());
    app.use(passport.session());

    const authName = Config.server.isDev ? 'localAuth' : 'aad';
    const authStrategy = await getStrategy(discoverUrl);

    passport.use(authName, authStrategy);
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    passport.deserializeUser((user, done) => {
        done(null, user as Express.User);
    });

    app.get('/login', passport.authenticate(authName, { failureRedirect: '/login-failed' }));
    app.get('/oauth2/callback', passport.authenticate(authName, { failureRedirect: '/login-failed' }), (req, res) => {
        res.redirect(req.session.redirectTo ?? '/');
    });
    app.get('/login-failed', (_req, res) => {
        res.send('login failed');
    });
}
