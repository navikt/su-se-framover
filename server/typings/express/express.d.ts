import * as OpenIdClient from 'openid-client';
export type TokenSets = { [key: string]: OpenIdClient.TokenSet };

declare global {
    // biome-ignore lint/style/noNamespace: Fungerer kun med namespace override
    namespace Express {
        interface User {
            tokenSets: { [key: string]: OpenIdClient.TokenSet };
        }
    }
}

declare module 'express-session' {
    interface SessionData {
        redirectTo?: string;
    }
}
