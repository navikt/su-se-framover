import { Periode } from '~src/types/Periode';

export interface Uføregrunnlag {
    id: string;
    periode: Periode<string>;
    uføregrad: number;
    forventetInntekt: number;
}
