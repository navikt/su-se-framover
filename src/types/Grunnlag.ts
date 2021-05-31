import { Nullable } from '~lib/types';

import { Periode } from './Periode';

export interface Uføregrunnlag {
    periode: Periode<string>;
    uføregrad: number;
    forventetInntekt: number;
    begrunnelse: Nullable<string>;
}

export interface Bosituasjon {
    /* Kun brukt i debuggingsøyemed foreløpig */
    type: string;
    fnr: Nullable<string>;
    delerBolig: Nullable<boolean>;
    ektemakeEllerSamboerUførFlyktning: Nullable<boolean>;
    begrunnelse: Nullable<string>;
}
