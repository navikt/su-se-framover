import { NullablePeriode } from '~src/types/Periode';
import { lagTomPeriode } from '~src/utils/periode/periodeUtils';
export interface FormueVilkårFormData {
    formue: FormuegrunnlagFormData[];
}

export interface FormuegrunnlagFormData {
    periode: NullablePeriode;
    søkersFormue: FormuegrunnlagVerdierFormData;
    epsFormue: FormuegrunnlagVerdierFormData;
}

export interface FormuegrunnlagVerdierFormData {
    verdiPåBolig: string;
    verdiPåEiendom: string;
    verdiPåKjøretøy: string;
    innskuddsbeløp: string;
    verdipapir: string;
    kontanterOver1000: string;
    stårNoenIGjeldTilDeg: string;
    depositumskonto: string;
}

export const verdierId: Array<keyof FormuegrunnlagVerdierFormData> = [
    'verdiPåBolig',
    'verdiPåEiendom',
    'verdiPåKjøretøy',
    'innskuddsbeløp',
    'verdipapir',
    'stårNoenIGjeldTilDeg',
    'kontanterOver1000',
    'depositumskonto',
];

export const nyFormuegrunnlagMedEllerUtenPeriode = (periode?: NullablePeriode): FormuegrunnlagFormData => {
    return {
        periode: periode ?? lagTomPeriode(),
        søkersFormue: getTomFormueVerdier(),
        epsFormue: getTomFormueVerdier(),
    };
};

const getTomFormueVerdier = (): FormuegrunnlagVerdierFormData => {
    return {
        verdiPåBolig: '0',
        verdiPåEiendom: '0',
        verdiPåKjøretøy: '0',
        innskuddsbeløp: '0',
        verdipapir: '0',
        kontanterOver1000: '0',
        stårNoenIGjeldTilDeg: '0',
        depositumskonto: '0',
    };
};
