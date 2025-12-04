
export interface NyeUtbetalingslinjerResponse {
    success: UtbetalingslinjeSuccessResponse[];
    failed: UtbetalingslinjeErrorResponse[];
}

export interface UtbetalingslinjeSuccessResponse {
    utbetalingId: string;
}

export interface UtbetalingslinjeErrorResponse {
    utbetalingId: string;
    feilmelding: string;
}
