import { Periode } from '~types/Periode';

export interface Uføregrunnlag {
    periode: Periode<string>;
    uføregrad: number;
    forventetInntekt: number;
}
