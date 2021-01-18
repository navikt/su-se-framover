import path from 'path';

function envVar({ name, defaultValue }: { name: string; defaultValue?: string }): string {
    const fromEnv = process.env[name];
    if (fromEnv) {
        return fromEnv;
    }
    if (defaultValue) {
        return defaultValue;
    }
    throw new Error(`Missing required environment variable ${name}`);
}

// Config used internally in the server
export const server = {
    host: envVar({ name: 'HOST', defaultValue: 'localhost' }),
    port: Number.parseInt(envVar({ name: 'PORT', defaultValue: '1234' })),

    frontendDir: envVar({ name: 'FRONTEND_DIR', defaultValue: path.join(__dirname, 'frontend') }),

    sessionKey: envVar({ name: 'SESSION_KEY' }),
    sessionCookieName: envVar({ name: 'SESSION_COOKIE_NAME', defaultValue: 'supstonad-login-cookie' }),

    isDev: envVar({ name: 'NODE_ENV' }) === 'development',
    isProd: envVar({ name: 'NODE_ENV' }) === 'production',

    mockOauthServerPort: Number.parseInt(envVar({ name: 'LOCAL_AUTH_SERVER_PORT', defaultValue: '' })),
};

// For auth
export const auth = {
    discoverUrl: envVar({ name: 'AZURE_APP_WELL_KNOWN_URL', defaultValue: server.isDev ? 'x' : '' }),
    clientId: envVar({ name: 'AZURE_APP_CLIENT_ID', defaultValue: server.isDev ? 'supstonad' : '' }),
    clientSecret: envVar({ name: 'AZURE_APP_CLIENT_SECRET', defaultValue: server.isDev ? 'superhemmelig' : '' }),
    jwks: JSON.parse(envVar({ name: 'AZURE_APP_JWKS', defaultValue: server.isDev ? '{}' : '' })),

    redirectUri: envVar({ name: 'AUTH_REDIRECT_URI' }),

    tokenEndpointAuthMethod: 'private_key_jwt',
    responseType: 'code',
    responseMode: 'query',
    tokenEndpointAuthSigningAlg: 'RS256',
};

// Config that is exposed to the frontend
export const client = {
    SU_SE_BAKOVER_URL: envVar({ name: 'SU_SE_BAKOVER_URL' }),
    AMPLITUDE_API_KEY: envVar({ name: 'AMPLITUDE_API_KEY' }),
    FEATURE_HENDELSESLOGG: envVar({ name: 'FEATURE_HENDELSESLOGG' }),
};

export type FrontendConfig = typeof client;
