import { Nullable } from '~lib/types';

import { Periode } from './Periode';
import { FormuegrunnlagVerdier } from './Revurdering';

export interface Uføregrunnlag {
    periode: Periode<string>;
    uføregrad: number;
    forventetInntekt: number;
    begrunnelse: Nullable<string>;
}

export interface Formuegrunnlag {
    søkersFormue: FormuegrunnlagVerdier;
    epsFormue: Nullable<FormuegrunnlagVerdier>;
}

export interface Bosituasjon {
    type: BosituasjonTyper;
    fnr: Nullable<string>;
    delerBolig: Nullable<boolean>;
    ektemakeEllerSamboerUførFlyktning: Nullable<boolean>;
    begrunnelse: Nullable<string>;
    sats: Nullable<string>;
    periode: Periode<string>;
}

export enum BosituasjonTyper {
    DELER_BOLIG_MED_VOKSNE = 'DELER_BOLIG_MED_VOKSNE',
    EPS_IKKE_UFØR_FLYKTNING = 'EPS_IKKE_UFØR_FLYKTNING',
    EPS_OVER_67 = 'EPS_OVER_67',
    EPS_UFØR_FLYKTNING = 'EPS_UFØR_FLYKTNING',
    ENSLIG = 'ENSLIG',
    UFULLSTENDIG_HAR_EPS = 'UFULLSTENDIG_HAR_EPS',
    UFULLSTENDIG_HAR_IKKE_EPS = 'UFULLSTENDIG_HAR_IKKE_EPS',
}

export const erBosituasjonFullstendig = (b: Bosituasjon) => {
    return [
        BosituasjonTyper.DELER_BOLIG_MED_VOKSNE,
        BosituasjonTyper.EPS_IKKE_UFØR_FLYKTNING,
        BosituasjonTyper.EPS_OVER_67,
        BosituasjonTyper.EPS_UFØR_FLYKTNING,
        BosituasjonTyper.ENSLIG,
    ].includes(b.type);
};
