import connectRedis from 'connect-redis';
import { Express } from 'express';
import session from 'express-session';
import * as redis from 'redis';

import * as Config from './config';

const SESSION_MAX_AGE_MILLIS = 60 * 60 * 1000;

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

export default function setupSession(app: Express) {
    app.set('trust proxy', 1);

    app.use(
        session({
            cookie: {
                maxAge: SESSION_MAX_AGE_MILLIS,
                sameSite: 'lax',
                httpOnly: true,
                secure: Config.server.isProd,
            },
            secret: Config.server.sessionKey,
            name: Config.server.sessionCookieName,
            resave: false,
            saveUninitialized: false,
            unset: 'destroy',
            store: getRedisStore(),
        })
    );
}
