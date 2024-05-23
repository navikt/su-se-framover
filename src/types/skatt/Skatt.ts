import { ErrorMessage } from '~src/api/apiClient';
import { Nullable } from '~src/lib/types';

import { Sakstype } from '../Sak';

export interface Skattegrunnlag {
    fnr: string;
    hentetTidspunkt: string;
    årsgrunnlag: Årsgrunnlag[];
    saksbehandler: string;
    årSpurtFor: { fra: number; til: number };
}

export type Årsgrunnlag = Stadie | StadieFeil;

export interface Stadie {
    stadie: string;
    inntektsår: number;
    grunnlag: SkattegrunnlagForÅr;
}

export interface StadieFeil {
    error: ErrorMessage;
    inntektsår: number;
}

export interface SkattegrunnlagForÅr {
    oppgjørsdato: Nullable<string>;
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

export interface FrioppslagSkattRequest {
    fnr: Nullable<string>;
    epsFnr: Nullable<string>;
    år: number;
    begrunnelse: string;
    sakstype: Sakstype;
    fagsystemId: string;
}
