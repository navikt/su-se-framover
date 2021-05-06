import { Nullable } from '~lib/types';

import { Periode } from './Periode';

export interface Uføregrunnlag {
    periode: Periode<string>;
    uføregrad: number;
    forventetInntekt: number;
    begrunnelse: Nullable<string>;
}
export interface Grunnlag {
    uføre: Uføregrunnlag[];
}
