export interface Simulering {
    totalBruttoYtelse: number;
    perioder: SimulertPeriode[];
}

export interface SimulertPeriode {
    fraOgMed: string;
    tilOgMed: string;
    bruttoYtelse: number;
}
