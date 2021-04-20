export interface Simulering {
    totalBruttoYtelse: number;
    perioder: SimulertPeriode[];
}

export interface SimulertPeriode {
    fraOgMed: string;
    tilOgMed: string;
    bruttoYtelse: number;
    type: SimulertUtbetalingstype;
}

export enum SimulertUtbetalingstype {
    ETTERBETALING = 'ETTERBETALING',
    FEILUTBETALING = 'FEILUTBETALING',
    ORDINÆR = 'ORDINÆR',
    UENDRET = 'UENDRET',
    INGEN_UTBETALING = 'INGEN_UTBETALING',
}
