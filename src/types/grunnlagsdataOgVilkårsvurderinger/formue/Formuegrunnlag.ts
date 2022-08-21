import { Nullable } from '~src/lib/types';
import { Periode } from '~src/types/Periode';

export interface Formuegrunnlag {
    søkersFormue: FormuegrunnlagVerdier;
    epsFormue: Nullable<FormuegrunnlagVerdier>;
}
export type FormuegrunnlagVerdierRequest = FormuegrunnlagVerdier;

export interface FormuegrunnlagVerdier {
    verdiIkkePrimærbolig: number;
    verdiEiendommer: number;
    verdiKjøretøy: number;
    innskudd: number;
    verdipapir: number;
    kontanter: number;
    pengerSkyldt: number;
    depositumskonto: number;
}

export interface FormuegrunnlagRequest {
    periode: Periode<string>;
    søkersFormue: FormuegrunnlagVerdierRequest;
    epsFormue: Nullable<FormuegrunnlagVerdierRequest>;
    måInnhenteMerInformasjon: boolean;
}
