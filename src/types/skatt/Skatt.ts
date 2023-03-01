import { Nullable } from '~src/lib/types';

export interface Skattegrunnlag {
    fnr: string;
    hentetTidspunkt: string;
    årsgrunnlag: Årsgrunnlag[];
}

export interface Årsgrunnlag {
    inntektsår: number;
    skatteoppgjørsdato: Nullable<Date>;
    grunnlag: Skattegrunnlagsliste;
}

export interface Skattegrunnlagsliste {
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
