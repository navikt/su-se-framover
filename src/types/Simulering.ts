export interface Simulering {
    totalBruttoYtelse: number;
    perioder: SimulertPeriode[];
}

export interface SimulertPeriode {
    fraOgMed: string;
    tilOgMed: string;
    kontooppstilling: Kontooversikt;
}

export interface Kontooversikt {
    simulertUtbetaling: number;
    debetYtelse: number;
    kreditYtelse: number;
    debetFeilkonto: number;
    kreditFeilkonto: number;
    debetMotpostFeilkonto: number;
    kreditMotpostFeilkonto: number;
    sumYtelse: number;
    sumFeilkonto: number;
    sumMotpostFeilkonto: number;
}
