export interface Simulering {
    utbetalingId: string;
    opprettet: string;
    totalBruttoYtelse: number;
    perioder: SimulertPeriode[];
}

export interface SimulertPeriode {
    fraOgMed: string;
    tilOgMed: string;
    bruttoYtelse: number;
}
