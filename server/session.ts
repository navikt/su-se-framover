import { Express } from 'express';
import session from 'express-session';

import * as Config from './config';

const SESSION_MAX_AGE_MILLIS = 60 * 60 * 1000;

export default function setupSession(app: Express) {
    app.set('trust proxy', 1);
    app.use(
        session({
            cookie: {
                maxAge: SESSION_MAX_AGE_MILLIS,
                sameSite: 'strict',
                httpOnly: true,
            },
            secret: Config.server.sessionKey,
            name: Config.server.sessionCookieName,
            resave: false,
            saveUninitialized: false,
            unset: 'destroy',
        })
    );
}
