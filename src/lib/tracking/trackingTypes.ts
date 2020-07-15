export interface TrackingEvent<T extends TrackingCode, U> {
    code: T;
    data: U;
}

export enum TrackingCode {
    StartBeregning = 'start_beregning',
}
