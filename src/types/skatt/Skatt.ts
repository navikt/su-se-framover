import { Nullable } from '~src/lib/types';

export interface SamletSkattegrunnlag {
    fnr: string;
    inntektsår: string;
    grunnlag: Skattegrunnlag[];
    skatteoppgjoersdato: Nullable<string>;
}

export interface Skattegrunnlag {
    navn: string;
    beløp: number;
    kategori: string[];
}

export enum SkattegrunnlagKategori {
    FORMUE = 'formue',
    INNTEKT = 'inntekt',
}
