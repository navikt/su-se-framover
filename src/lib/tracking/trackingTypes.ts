export interface TrackingEvent<T extends TrackingCode, U> {
    event: T;
    data: U;
}

export enum TrackingCode {
    StartBeregning = 'start_beregning',
}
