import { Nullable } from '~lib/types';
import { Periode } from '~types/Periode';

export interface Uføregrunnlag {
    periode: Periode<string>;
    uføregrad: number;
    forventetInntekt: number;
    begrunnelse: Nullable<string>;
}
