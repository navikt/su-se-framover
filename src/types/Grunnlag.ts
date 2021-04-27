import { Nullable } from '~lib/types';

import { Periode } from './Periode';

export interface Uføregrunnlag {
    periode: Periode<string>;
    uføregrad: Nullable<number>;
    forventetInntekt: Nullable<number>;
}
export interface Grunnlag {
    uføre: Uføregrunnlag[];
}
export interface SimulertEndringGrunnlag {
    førBehandling: Grunnlag;
    endring: Grunnlag;
    resultat: Grunnlag;
}
