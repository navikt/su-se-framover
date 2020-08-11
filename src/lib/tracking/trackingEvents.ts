import { TrackingCode } from './trackingTypes';

export interface TrackingEvent<T extends TrackingCode, U> {
    code: T;
    data: U;
    __secret: typeof secretSymbol;
}

const secretSymbol = Symbol('super secret');

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
        __secret: secretSymbol,
    });
};

export const startBeregning = createEvent<{ sakId: string; behandlingId: string }, TrackingCode.StartBeregning>(
    TrackingCode.StartBeregning
);

export const søknadOppsummeringEndreSvarKlikk = createEvent<
    { ident: string },
    TrackingCode.SøknadOppsummeringEndreSvarKlikk
>(TrackingCode.SøknadOppsummeringEndreSvarKlikk);
export const søknadHjelpeTekstKlikk = createEvent<void, TrackingCode.SøknadHjelpeTekstKlikk>(
    TrackingCode.SøknadHjelpeTekstKlikk
);
export const søknadSendInn = createEvent<{ ident: string }, TrackingCode.SøknadSendInn>(TrackingCode.SøknadSendInn);
export const søknadNesteSteg = createEvent<{ ident: string; steg: string }, TrackingCode.SøknadSendInn>(
    TrackingCode.SøknadSendInn
);
