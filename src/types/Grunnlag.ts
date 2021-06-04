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
    type: BosituasjonTyper;
    fnr: Nullable<string>;
    delerBolig: Nullable<boolean>;
    ektemakeEllerSamboerUførFlyktning: Nullable<boolean>;
    begrunnelse: Nullable<string>;
    sats: Nullable<string>;
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
    return (
        b.type === BosituasjonTyper.DELER_BOLIG_MED_VOKSNE ||
        b.type === BosituasjonTyper.EPS_IKKE_UFØR_FLYKTNING ||
        b.type === BosituasjonTyper.EPS_OVER_67 ||
        b.type === BosituasjonTyper.EPS_UFØR_FLYKTNING ||
        b.type === BosituasjonTyper.ENSLIG
    );
};
