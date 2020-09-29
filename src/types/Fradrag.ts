import { Nullable } from '~lib/types';

export interface Fradrag {
    type: Fradragstype;
    beløp: number;
    fraUtland: boolean;
    delerAvPeriodeChecked: boolean;
    fraUtlandInntekt: FraUtlandInntekt;
    delerAvPeriode: DelerAvPeriode;
}

export interface FraUtlandInntekt {
    beløpUtenlandskValuta: Nullable<number>;
    valuta: Nullable<string>;
    kurs: Nullable<number>;
}

export interface DelerAvPeriode {
    fraOgMed: Nullable<Date>;
    tilOgMed: Nullable<Date>;
}

export enum Fradragstype {
    Uføretrygd = 'Uføretrygd',
    Barnetillegg = 'Barnetillegg',
    Arbeidsinntekt = 'Arbeidsinntekt',
    Pensjon = 'Pensjon',
    Kapitalinntekt = 'Kapitalinntekt',
    AndreYtelser = 'AndreYtelser',
}
