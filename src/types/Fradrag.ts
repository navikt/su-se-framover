import { Nullable } from '~lib/types';

export interface Fradrag {
    type: Fradragstype;
    beløp: number;
    fraUtland: boolean;
    delerAvPeriode: boolean;
    fraUtlandInntekt: FraUtlandInntekt;
    delerAvPeriodeData: DelerAvPeriode;
}

export interface FraUtlandInntekt {
    beløpUtenlandskValuta: Nullable<string>;
    valuta: Nullable<string>;
    kurs: Nullable<string>;
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
