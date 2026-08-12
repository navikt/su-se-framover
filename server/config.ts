import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function optionalEnvVar(name: string): string | undefined {
    return process.env[name] || undefined;
}

function envVar({
    name,
    defaultValue,
}: {
    name: string;
    defaultValue?:
        | string
        | {
              dev?: string;
              prod?: string;
          };
}): string {
    const fromEnv = process.env[name];
    if (fromEnv) {
        return fromEnv;
    }
    if (typeof defaultValue === 'string') {
        return defaultValue;
    } else if (typeof defaultValue === 'object') {
        if (isDev && typeof defaultValue.dev === 'string') {
            return defaultValue.dev;
        }
        if (isProd && typeof defaultValue.prod === 'string') {
            return defaultValue.prod;
        }
    }
    throw new Error(`Missing required environment variable ${name}`);
}

export const isDev = envVar({ name: 'NODE_ENV' }) === 'development';
export const isProd = envVar({ name: 'NODE_ENV' }) === 'production';

// Config used internally in the server
export const server = {
    host: envVar({ name: 'HOST', defaultValue: 'localhost' }),
    port: Number.parseInt(envVar({ name: 'PORT', defaultValue: '5678' })),
    suSeBakoverUrl: envVar({ name: 'SU_SE_BAKOVER_URL', defaultValue: 'http://localhost:8080' }),

    frontendDir: envVar({ name: 'FRONTEND_DIR', defaultValue: path.join(__dirname, 'frontend') }),

    logLevel: envVar({ name: 'LOG_LEVEL', defaultValue: 'info' }),
};

export const frontend = {
    environment: envVar({ name: 'APP_ENV', defaultValue: { dev: 'local', prod: 'production' } }),
    umami: {
        scriptUrl: optionalEnvVar('UMAMI_SCRIPT_URL'),
        websiteId: optionalEnvVar('UMAMI_WEBSITE_ID'),
    },
    cachebuster: envVar({ name: 'NAIS_APP_IMAGE', defaultValue: '1' }),
};

// Auth-config. Verdiene injiseres av NAIS (azure.application) i dev/prod. Lokalt har de
// defaults som peker på docker-compose-stacken (mock-oauth2-server), så oppsettet er plug-and-play.
export const auth = {
    // Appens egen client-id. Brukt som forventet audience ved validering av innkommende token.
    clientId: envVar({ name: 'AZURE_APP_CLIENT_ID', defaultValue: { dev: 'supstonad' } }),
    // Client-secret for OBO-veksling mot Azure sitt token-endpoint.
    clientSecret: envVar({ name: 'AZURE_APP_CLIENT_SECRET', defaultValue: { dev: 'supstonad-secret' } }),
    // Forventet issuer og JWKS for signaturvalidering av innkommende token.
    issuer: envVar({ name: 'AZURE_OPENID_CONFIG_ISSUER', defaultValue: { dev: 'http://localhost:4321/default' } }),
    jwksUri: envVar({
        name: 'AZURE_OPENID_CONFIG_JWKS_URI',
        defaultValue: { dev: 'http://localhost:4321/default/jwks' },
    }),
    // Azure sitt token-endpoint, brukt til OBO-veksling (on-behalf-of).
    tokenEndpoint: envVar({
        name: 'AZURE_OPENID_CONFIG_TOKEN_ENDPOINT',
        defaultValue: { dev: 'http://localhost:4321/default/token' },
    }),
    // su-se-bakover sin app-identifikator (cluster.namespace.app), brukt til å bygge OBO-scope.
    suSeBakoverUri: envVar({ name: 'SU_SE_BAKOVER_AAD_APP_NAME', defaultValue: { dev: 'su-se-bakover' } }),
};
