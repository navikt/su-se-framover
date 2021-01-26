import { Express } from 'express';
import * as OpenIdClient from 'openid-client';
import passport from 'passport';

import * as Config from '../config';

import * as AuthUtils from './utils';

declare module 'express-session' {
    interface SessionData {
        redirectTo?: string;
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface User {
            claims: OpenIdClient.IdTokenClaims;
            tokenSets: {
                [key: string]: OpenIdClient.TokenSet;
            };
        }
    }
}

async function getStrategy(authClient: OpenIdClient.Client) {
    return new OpenIdClient.Strategy(
        {
            client: authClient,
            params: {
                response_type: Config.auth.responseType,
                response_mode: Config.auth.responseMode,
                scope: `openid ${Config.auth.clientId}/.default`,
            },
            usePKCE: 'S256',
        },
        (tokenSet: OpenIdClient.TokenSet, done: (err: unknown, user?: unknown) => void) => {
            if (tokenSet.expired()) {
                return done(null, false);
            }
            const user: Express.User = {
                tokenSets: {
                    [AuthUtils.tokenSetSelfId]: tokenSet,
                },
                claims: tokenSet.claims(),
            };
            done(null, user);
        }
    );
}

export default async function setup(app: Express, authClient: OpenIdClient.Client) {
    app.use(passport.initialize());
    app.use(passport.session());

    const authName = Config.server.isDev ? 'localAuth' : 'aad';
    const authStrategy = await getStrategy(authClient);

    passport.use(authName, authStrategy);
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    passport.deserializeUser((user, done) => {
        done(null, user as Express.User);
    });

    app.get('/login', passport.authenticate(authName, { failureRedirect: '/login-failed' }));
    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });
    app.get('/oauth2/callback', passport.authenticate(authName, { failureRedirect: '/login-failed' }), (req, res) => {
        res.redirect(req.session.redirectTo ?? '/');
    });
    app.get('/login-failed', (_req, res) => {
        res.send('login failed');
    });
}
