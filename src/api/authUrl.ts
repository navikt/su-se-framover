export const LOGIN_URL = '/oauth2/login';
export const LOGOUT_URL = '/oauth2/logout';

// Header som BFF-en setter på sine EGNE auth-401 (utløpt/ugyldig Wonderwall-session). Kun da
// skal frontend auto-redirecte til innlogging. En 401 som su-se-bakover returnerer transparent
// gjennom proxyen har IKKE denne headeren, så vi unngår endeløs re-login-loop ved backend-feil.
// MERK: samme streng må brukes i server (server/auth/index.ts -> LOGIN_REQUIRED_HEADER).
export const LOGIN_REQUIRED_HEADER = 'x-login-required';
