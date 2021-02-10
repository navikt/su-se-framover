import amplitude from 'amplitude-js';

import { TrackingEvent } from './trackingEvents';
import { TrackingCode } from './trackingTypes';

let amplitudeClient: amplitude.AmplitudeClient | null = null;

export function init() {
    if (amplitudeClient !== null) {
        throw new Error('Amplitude has already been initialized');
    }

    amplitudeClient = amplitude.getInstance();
    amplitudeClient.init('default', '', {
        apiEndpoint: 'amplitude.nav.no/collect-auto',
        saveEvents: false,
        includeUtm: true,
        includeReferrer: true,
        platform: window.location.toString(),
    });
}

const logEvent: amplitude.AmplitudeClient['logEvent'] = (...args) => {
    if (amplitudeClient === null) {
        throw new Error('Not init');
    }
    return amplitudeClient.logEvent(...args);
};

export const trackEvent = <T extends TrackingCode, U>(event: TrackingEvent<T, U>) => {
    const eventCode = `#su.${event.code}`;

    if (process.env.NODE_ENV === 'development') {
        console.groupCollapsed(`[tracking]: ${eventCode}`);
        console.log(event);
        console.groupEnd();
        return;
    }

    logEvent(eventCode, event.data);
};
