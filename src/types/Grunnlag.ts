import { Periode } from './Periode';

export interface Uføregrunnlag {
    periode: Periode<string>;
    uføregrad: number;
    forventetInntekt: number;
}
export interface Grunnlag {
    uføre: Uføregrunnlag[];
}
export interface SimulertEndringGrunnlag {
    førBehandling: Grunnlag;
    endring: Grunnlag;
    resultat: Grunnlag;
}
