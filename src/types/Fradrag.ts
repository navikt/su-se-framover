import { Nullable } from '~lib/types';

export interface Fradrag {
    type: Fradragstype;
    beløp: number;
    fraUtlandInntekt: Nullable<FraUtlandInntekt>;
    delerAvPeriode: Nullable<DelerAvPeriode>;
}

export interface FraUtlandInntekt {
    beløpUtenlandskValuta: number;
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
    fraUtlandInntekt = 'fraUtlandInntekt',
    delerAvPeriode = 'delerAvPeriode',
}

export enum FraUtlandInntektKeys {
    beløpUtenlandskValuta = 'beløpUtenlandskValuta',
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
