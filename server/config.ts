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
    suSeBakoverUrl: envVar({ name: 'SU_SE_BAKOVER_URL', defaultValue: 'http://localhost:8080' }),

    frontendDir: envVar({ name: 'FRONTEND_DIR', defaultValue: path.join(__dirname, 'frontend') }),

    sessionKey: envVar({ name: 'SESSION_KEY' }),
    sessionCookieName: envVar({ name: 'SESSION_COOKIE_NAME', defaultValue: 'supstonad-login-cookie' }),

    isDev: envVar({ name: 'NODE_ENV' }) === 'development',
    isProd: envVar({ name: 'NODE_ENV' }) === 'production',

    mockOauthServerPort: Number.parseInt(envVar({ name: 'LOCAL_AUTH_SERVER_PORT', defaultValue: '4321' })),
};

// For auth
export const auth = {
    discoverUrl: envVar({
        name: 'AZURE_APP_WELL_KNOWN_URL',
        defaultValue: server.isDev ? 'http://localhost:4321/default' : '',
    }),
    clientId: envVar({ name: 'AZURE_APP_CLIENT_ID', defaultValue: server.isDev ? 'supstonad' : '' }),
    jwks: server.isDev
        ? // Generert med https://mkjwk.org/ (key size: 2048, key use: signature, algorithm: RS256, key id: sha-256)
          {
              keys: [
                  {
                      p:
                          '5m7Jqtqf_fo_5B6T8WfBkJqB5lSRlhR7t5uQ0-M9S0fwa1_MUgjOKecUdwg6iFkX4fxNNYq1y_RcTMngeHZX_7w9_lOZ3qB6PKxE9G1rNzZMu_athRecbOTGUzqyfG-2CIVUGAXPszjzYtTlRx8CG90tKpCurIfb0hquunsfqG0',
                      kty: 'RSA',
                      q:
                          'qEFXs7PiQQGlzL78SZAwEk53YWegL-p3Pjsm57O_pTGu2JHVoOwcRmY6VpDBca51z-HiupCbhs2Lbc2MGO_xrPJqkIJ_yvywnizX9O5JWzkMd7qIJDyw9tcuof9EQlmBr0_xXbCQ19N_sBkZRWa_uXs3iujfAGD0DzNorqd6bJ0',
                      d:
                          'jXJ-8KhehKPIzCtcU0uuyC145mD7W_OS7J4VILZBAmxnUs4aJZmx_Vv8PGqjC0Is9z5gajanpbrdIH9nBC-jhKkovhpZ5ipceLPbiQx5CFsK0bXcGVBrlh6gWcJiyCZ0VrM6ogMu6hnuY4NCv7z3XFhp5kj3EyraPpt1fLee_JGrpn1iyiXaerHvWfn0lIbJU3ppmCfF9iX-7Ky9SvHNoNmL-aFd_pp9BmBLmL4sTHk6SwCJoS9Bjg_MWosMlP8kjk4YfouUwiCPgcDAhhj0PgFxVI2O4YUPcQEe4KYacAhk7k130WJGeslCQ7-n-ftVaYKskQgO0Vyni-8u7oTbgQ',
                      e: 'AQAB',
                      use: 'sig',
                      kid: 'wO_HE0jAZzwKF8WdE4p3NorrJ2b_CQrju7tzTAP2Ayc',
                      qi:
                          'sumvcvFirOmVjS_Mf6e3qllltr-5gcNfrlFK2giVKaeplXNVxP6FgeCSilg5XldBQdugJJ42kJooZ3_5EmphtfgHX9RusSGoYgkiRzTOTHtuN9wYG5_oHv6hSQJFaYwM59gRhGSi6dpNY9y3Td9i8N713-56FHTaTGHHiOqwt94',
                      dp:
                          'tfFP5klM_lozTEkggwFrgmOcoWKwuRFfRe_dAJBx-xjIKd-wEi3Fqqw8Kmgi3zmJc_OketwVAv7kSfUz-alnfhMB1-fmnDOVkIZsw5oJh8Sl_dud0nJ8HjbcqSa1ey8xSbUMWxNrlZUoBycWCXvgTGPsn6kxYiS7Wj-bKr7Allk',
                      alg: 'RS256',
                      dq:
                          'IktfQuORZEqfrsHmzl-zTKftsU7b2ahisa6A2Y1LrLIZv07KSkiV4suHbImIxFEY9kxGWFyNNsbCepkAyzxs-CFZEydmQMuMfFELm4LONOfF4MmGYkx0jXuCp8ZN9XAk_MTAn6YTf8o-JniXLAwrW_T_dzLL8VnRpR-HYMIGNAk',
                      n:
                          'l3OFarvFs2MQOk3c3JmFjcDEBd0CKXxMSfM5x6J0NVLrnqev6btfWytNse8RMIFBc_w3tnw1yb0o1bnVQOf5htywbgdCwRSFlXc8DBQ35doAyhlrkcTuQqCiLkCyUTY5NEMgLTp1OzonrCgthIhYK_cPFboxK2e_ZT1II8otylbp93iA84a3LGYVj-AgQuhb6wfKGtL5aiug9nPrEVinnGqv3VhNf5uwlOZ77UbQSGvlNnc59ZzAump3R8mdnM8m1TcOxae2c-8Ru00rgNF9r4OxZFCLPsVQJvaY0XTmshNNH-4OJmAbjHcTpzwyfUWyCDlv_pvC5fuD6-paPGpG2Q',
                  },
              ],
          }
        : JSON.parse(envVar({ name: 'AZURE_APP_JWKS' })),

    redirectUri: envVar({ name: 'AUTH_REDIRECT_URI' }),

    suSeBakoverClientId: envVar({ name: 'SU_SE_BAKOVER_CLIENT_ID' }),

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
