import type * as OpenIdClient from 'openid-client';

export type StoredTokenSet = OpenIdClient.TokenEndpointResponse & {
    receivedAt?: number;
};

export type NormalizedTokenSet = OpenIdClient.TokenEndpointResponse & {
    receivedAt: number;
};

export type TokenSets = { [key: string]: StoredTokenSet };

declare global {
    // biome-ignore lint/style/noNamespace: Fungerer kun med namespace override
    namespace Express {
        interface User {
            tokenSets: TokenSets;
        }
    }
}

declare module 'express-session' {
    interface SessionData {
        redirectTo?: string;
    }
}
