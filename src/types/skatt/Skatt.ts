import { Nullable } from '~src/lib/types';

export interface SamletSkattegrunnlag {
    personidentifikator: string;
    inntektsaar: string;
    skjermet: boolean;
    grunnlag: Skattegrunnlag[];
    skatteoppgjoersdato: Nullable<string>;
}

export interface Skattegrunnlag {
    tekniskNavn: string;
    beloep: number;
    kategori: string[];
}
