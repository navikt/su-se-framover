import { Nullable } from '~src/lib/types';

export interface Skattegrunnlag {
    fnr: string;
    hentetTidspunkt: string;
    årsgrunnlag: Årsgrunnlag[];
}

export interface Årsgrunnlag {
    stadie: string;
    inntektsår: number;
    skatteoppgjørsdato: Nullable<Date>;
    grunnlag: Grunnlagsliste;
}

export interface Grunnlagsliste {
    formue: Grunnlag[];
    inntekt: Grunnlag[];
    inntektsfradrag: Grunnlag[];
    formuesfradrag: Grunnlag[];
    verdsettingsrabattSomGirGjeldsreduksjon: Grunnlag[];
    oppjusteringAvEierinntekter: Grunnlag[];
    annet: Grunnlag[];
}

export interface Grunnlag {
    navn: string;
    beløp: string;
    spesifisering: KjøretøySpesifisering[];
}

export interface KjøretøySpesifisering {
    beløp: Nullable<string>;
    registreringsnummer: Nullable<string>;
    fabrikatnavn: Nullable<string>;
    årForFørstegangsregistrering: Nullable<string>;
    formuesverdi: Nullable<string>;
    antattVerdiSomNytt: Nullable<string>;
    antattMarkedsverdi: Nullable<string>;
}

export interface SkatteoppslagsFeil {
    httpCode: OppslagsFeil;
}

export interface OppslagsFeil {
    value: number;
    description: string;
}
