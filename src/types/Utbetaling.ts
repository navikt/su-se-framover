import { Simulering } from './Simulering';

export interface Utbetaling {
    id: string;
    opprettet: string;
    simulering: Simulering;
}

export interface NyeUtbetalingslinjerResponse {
    success: UtbetalingslinjeSuccessResponse[];
    failed: UtbetalingslinjeErrorResponse[];
}

export interface UtbetalingslinjeSuccessResponse {
    utbetalingId: string;
}

export interface UtbetalingslinjeErrorResponse {
    utbetalingId: string;
}
