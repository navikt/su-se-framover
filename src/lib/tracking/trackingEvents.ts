import { TrackingCode, TrackingEvent } from './trackingTypes';

export const trackEvent = <T extends TrackingCode, U>(event: TrackingEvent<T, U>) => {
    if (process.env.NODE_ENV === 'development') {
        console.groupCollapsed(`[tracking]: ${event.code}`);
        console.log(event);
        console.groupEnd();
    }

    // TODO: Log to amplitude
    event;
};

const createEvent = <U, T extends TrackingCode>(code: T) => {
    return (data: U): TrackingEvent<T, U> => ({
        code,
        data,
    });
};

export const startBeregning = createEvent<{ sakId: string; behandlingId: string }, TrackingCode.StartBeregning>(
    TrackingCode.StartBeregning
);

export const SøknadOppsummeringEndreSvarKlikk = createEvent<
    { ident: string },
    TrackingCode.SøknadOppsummeringEndreSvarKlikk
>(TrackingCode.SøknadOppsummeringEndreSvarKlikk);
