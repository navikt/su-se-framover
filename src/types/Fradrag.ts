import { Nullable } from '~lib/types';

export const ForventetInntektfradrag = 'Forventet inntekt' as const;
export type ForventetInntektfradrag = typeof ForventetInntektfradrag;

export interface Fradrag {
    type: Fradragstype | ForventetInntektfradrag;
    beløp: number;
    utenlandskInntekt: Nullable<UtenlandskInntekt>;
    delerAvPeriode: Nullable<DelerAvPeriode>;
}

export interface UtenlandskInntekt {
    beløpIUtenlandskValuta: number;
    valuta: string;
    kurs: number;
}

export interface DelerAvPeriode {
    fraOgMed: string;
    tilOgMed: string;
}

export enum Fradragstype {
    Uføretrygd = 'Uføretrygd',
    Barnetillegg = 'Barnetillegg',
    Arbeidsinntekt = 'Arbeidsinntekt',
    Pensjon = 'Pensjon',
    Kapitalinntekt = 'Kapitalinntekt',
    AndreYtelser = 'AndreYtelser',
}
