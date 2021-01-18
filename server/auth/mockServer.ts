import * as oauth2Mock from 'oauth2-mock-server';

import * as Config from '../config';

export default async function start() {
    const server = new oauth2Mock.OAuth2Server();

    await server.issuer.keys.generateRSA();

    await server.start(Config.server.mockOauthServerPort, 'localhost');

    if (server.issuer.url === null) {
        throw new Error('Failed to start mock Oauth server (no url returned)');
    }

    console.log(`Started mock OAuth server on: ${server.issuer.url}`);
    return server.issuer.url;
}
