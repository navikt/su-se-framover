import type { TokenEndpointResponse } from 'openid-client';

export type StoredToken = TokenEndpointResponse & { expires_at?: number };
export type TokenSets = { [key: string]: StoredToken };

declare global {
    // biome-ignore lint/style/noNamespace: Fungerer kun med namespace override
    namespace Express {
        interface User {
            tokenSets: { [key: string]: StoredToken };
        }
    }
}

declare module 'express-session' {
    interface SessionData {
        redirectTo?: string;
    }
}
