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

    isDev: envVar({ name: 'NODE_ENV' }) === 'development',
    isProd: envVar({ name: 'NODE_ENV' }) === 'production',
};

// Config that is exposed to the frontend
export const client = {
    SU_SE_BAKOVER_URL: envVar({ name: 'SU_SE_BAKOVER_URL' }),
    AMPLITUDE_API_KEY: envVar({ name: 'AMPLITUDE_API_KEY' }),
    FEATURE_HENDELSESLOGG: envVar({ name: 'FEATURE_HENDELSESLOGG' }),
};

export type FrontendConfig = typeof client;
