export interface Uføregrunnlag {
    periode: GrunnlagsPeriode;
    uføregrad: number;
    forventetInntekt: number;
}

export interface GrunnlagsPeriode {
    fraOgMed: string;
    tilOgMed: string;
}
