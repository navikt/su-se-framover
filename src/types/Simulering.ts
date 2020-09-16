export interface Simulering {
    totalBruttoYtelse: number;
    perioder: SimulertPeriode[];
}

export interface SimulertPeriode {
    fom: string;
    tom: string;
    bruttoYtelse: number;
}
