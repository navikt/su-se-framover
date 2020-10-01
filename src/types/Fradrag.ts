import { Nullable, KeyDict } from '~lib/types';
import { FradragFormData } from '~pages/saksbehandling/steg/beregning/FradragInputs';

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

export const FradragObjectKeys: KeyDict<FradragFormData> = {
    type: 'type',
    beløp: 'beløp',
    fraUtland: 'fraUtland',
    delerAvPeriodeChecked: 'delerAvPeriodeChecked',
    utenlandskInntekt: 'utenlandskInntekt',
    delerAvPeriode: 'delerAvPeriode',
};

export const UtenlandskInntektKeys: KeyDict<UtenlandskInntekt> = {
    beløpIUtenlandskValuta: 'beløpIUtenlandskValuta',
    valuta: 'valuta',
    kurs: 'kurs',
};

export const DelerAvPeriodeKeys: KeyDict<DelerAvPeriode> = {
    fraOgMed: 'fraOgMed',
    tilOgMed: 'tilOgMed',
};

export enum Fradragstype {
    Uføretrygd = 'Uføretrygd',
    Barnetillegg = 'Barnetillegg',
    Arbeidsinntekt = 'Arbeidsinntekt',
    Pensjon = 'Pensjon',
    Kapitalinntekt = 'Kapitalinntekt',
    AndreYtelser = 'AndreYtelser',
}
