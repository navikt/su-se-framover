export interface Uføregrunnlag {
    periode: GrunnlagsPeriode;
    uføregrad: number;
    forventetInntekt: number;
}

export interface GrunnlagsPeriode {
    fraOgMed: string;
    tilOgMed: string;
}

export interface Grunnlag {
    uføre: Uføregrunnlag[];
}

// TODO jah: Dette mapper ikke nødvendigvis helt med backenden, siden vi ikke har bestemt oss om vi skal returnere hele grunnlaget eller kun det for uføre.
export interface SimulertEndringGrunnlag {
    førBehandling: Grunnlag;
    endring: Grunnlag;
    resultat: Grunnlag;
}
