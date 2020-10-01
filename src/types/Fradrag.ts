import { Nullable } from '~lib/types';

export interface Fradrag {
    type: Fradragstype;
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

export enum FradragObjectKeys {
    type = 'type',
    beløp = 'beløp',
    fraUtland = 'fraUtland',
    delerAvPeriodeChecked = 'delerAvPeriodeChecked',
    utenlandskInntekt = 'utenlandskInntekt',
    delerAvPeriode = 'delerAvPeriode',
}

export enum UtenlandskInntektKeys {
    beløpIUtenlandskValuta = 'beløpIUtenlandskValuta',
    valuta = 'valuta',
    kurs = 'kurs',
}

export enum DelerAvPeriodeKeys {
    fraOgMed = 'fraOgMed',
    tilOgMed = 'tilOgMed',
}

export enum Fradragstype {
    Uføretrygd = 'Uføretrygd',
    Barnetillegg = 'Barnetillegg',
    Arbeidsinntekt = 'Arbeidsinntekt',
    Pensjon = 'Pensjon',
    Kapitalinntekt = 'Kapitalinntekt',
    AndreYtelser = 'AndreYtelser',
}
