import amplitude from 'amplitude-js';

import Config from '~/config';

let amplitudeClient: amplitude.AmplitudeClient | null = null;

export function init() {
    if (amplitudeClient !== null) {
        throw new Error('Amplitude has already been initialized');
    }

    amplitudeClient = amplitude.getInstance();
    amplitudeClient.init(Config.AMPLITUDE_API_KEY, undefined, {
        apiEndpoint: 'amplitude.nav.no/collect',
        saveEvents: true,
        includeUtm: true,
        includeReferrer: true,
        trackingOptions: {
            city: false,
            ip_address: false,
            region: false,
        },
    });
}

export const logEvent: amplitude.AmplitudeClient['logEvent'] = (...args) => {
    if (amplitudeClient === null) {
        throw new Error('Not init');
    }
    return amplitudeClient.logEvent(...args);
};
