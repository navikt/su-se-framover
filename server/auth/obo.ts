import { Logger } from 'pino';

import * as Config from '../config.js';

type OnBehalfOfTokenResponse = {
    token_type: string;
    expires_in: number;
    access_token: string;
};

// Veksler brukerens token til et on-behalf-of-token for su-se-bakover ved å kalle
// Azure sitt token-endpoint direkte (grant jwt-bearer). I NAIS injiseres
// AZURE_APP_CLIENT_SECRET og AZURE_OPENID_CONFIG_TOKEN_ENDPOINT automatisk (azure.application).
export async function requestOboToken(assertion: string, scope: string, log: Logger): Promise<string | undefined> {
    const body = new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        client_id: Config.auth.clientId,
        client_secret: Config.auth.clientSecret,
        assertion,
        scope,
        requested_token_use: 'on_behalf_of',
    });

    const response = await fetch(Config.auth.tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: body.toString(),
    });

    if (!response.ok) {
        log.warn({ status: response.status, error: await response.text() }, 'requestOboToken: OBO-veksling feilet.');
        return undefined;
    }

    const token = (await response.json()) as OnBehalfOfTokenResponse;
    return token.access_token;
}
