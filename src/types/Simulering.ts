export interface Simulering {
    totalOppsummering: SimuleringsperiodeOppsummering;
    periodeOppsummering: SimuleringsperiodeOppsummering[];
}

export interface SimuleringsperiodeOppsummering {
    fraOgMed: string;
    tilOgMed: string;
    sumTilUtbetaling: number;
    sumEtterbetaling: number;
    sumFramtidigUtbetaling: number;
    sumTotalUtbetaling: number;
    sumTidligereUtbetalt: number;
    sumFeilutbetaling: number;
    sumReduksjonFeilkonto: number;
}
