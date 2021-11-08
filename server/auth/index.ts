import http from 'http';

import connectRedis from 'connect-redis';
import { Express } from 'express';
import session from 'express-session';
import * as OpenIdClient from 'openid-client';
import passport from 'passport';
import * as redis from 'redis';

import * as Config from '../config';

import * as AuthUtils from './utils';

declare module 'express-session' {
    interface SessionData {
        redirectTo?: string;
    }
}

export type TokenSets = { [key: string]: OpenIdClient.TokenSet };
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface User {
            tokenSets: TokenSets;
        }
    }
}

const SESSION_MAX_AGE_MILLIS = 60 * 60 * 1000 * 2;

function getRedisStore() {
    const RedisStore = connectRedis(session);

    const redisClient = redis.createClient({
        host: Config.redis.host,
        port: Config.redis.port,
        password: Config.redis.password,
    });
    redisClient.unref();

    return new RedisStore({
        client: redisClient,
        disableTouch: true,
    });
}

const authEnabledPath = /^(?!\/api\/toggles)/;

function setupSession(app: Express) {
    app.set('trust proxy', 1);

    app.use(
        authEnabledPath,
        session({
            cookie: {
                maxAge: SESSION_MAX_AGE_MILLIS,
                sameSite: 'lax',
                httpOnly: true,
                secure: Config.isProd,
            },
            secret: Config.server.sessionKey,
            name: Config.server.sessionCookieName,
            resave: true,
            saveUninitialized: false,
            unset: 'destroy',
            store: getRedisStore(),
            rolling: true,
        })
    );
}

async function getStrategy(authClient: OpenIdClient.Client) {
    return new OpenIdClient.Strategy(
        {
            client: authClient,
            params: {
                response_type: Config.auth.responseType,
                response_mode: Config.auth.responseMode,
                scope: `openid offline_access ${Config.auth.clientId}/.default`,
            },
            extras: { clientAssertionPayload: { aud: authClient.issuer.metadata['token_endpoint'] } },
            usePKCE: 'S256',
            passReqToCallback: true,
        },
        (
            req: http.IncomingMessage,
            tokenSet: OpenIdClient.TokenSet,
            done: (err: null, user?: Express.User) => void
        ) => {
            if (!tokenSet.expired()) {
                req.log.debug('OpenIdClient.Strategy: Mapping tokenSet to User.');
                return done(null, {
                    tokenSets: {
                        [AuthUtils.tokenSetSelfId]: tokenSet,
                    },
                });
            }
            // Passport kaller bare denne funksjonen for å mappe en ny innlogging til et User-objekt, så man skal ikke havne her.
            req.log.error(
                'OpenIdClient.Strategy: Failed to map tokenSet to User because the tokenSet has already expired.'
            );
            done(null, undefined);
        }
    );
}

export default async function setupAuth(app: Express, authClient: OpenIdClient.Client) {
    setupSession(app);

    app.use(authEnabledPath, passport.initialize());
    app.use(authEnabledPath, passport.session());

    const authName = Config.isDev ? 'localAuth' : 'aad';
    const authStrategy = await getStrategy(authClient);

    passport.use(authName, authStrategy);
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    passport.deserializeUser((user, done) => {
        done(null, user as Express.User);
    });

    app.get(
        '/login',
        (req, _res, next) => {
            if (typeof req.query.redirectTo === 'string') {
                req.session.redirectTo = req.query.redirectTo;
            }
            next();
        },
        passport.authenticate(authName, { failureRedirect: '/login-failed' })
    );
    app.get('/logout', (req, res) => {
        req.logout();
        req.session.destroy(() => {
            res.clearCookie(Config.server.sessionCookieName);
            const endSessionUrl = authClient.endSessionUrl({ post_logout_redirect_uri: Config.auth.logoutRedirectUri });
            req.log.debug(`Redirecting user via Azure's end_session_endpoint: ${endSessionUrl}`);
            res.redirect(endSessionUrl);
        });
    });
    app.get('/oauth2/callback', passport.authenticate(authName, { failureRedirect: '/login-failed' }), (req, res) => {
        res.redirect(req.session.redirectTo ?? '/');
    });
    app.get('/login-failed', (_req, res) => {
        res.send('login failed');
    });
}
