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

export enum Fradragstype {
    Uføretrygd = 'Uføretrygd',
    Barnetillegg = 'Barnetillegg',
    Arbeidsinntekt = 'Arbeidsinntekt',
    Pensjon = 'Pensjon',
    Kapitalinntekt = 'Kapitalinntekt',
    AndreYtelser = 'AndreYtelser',
}
