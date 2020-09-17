import { Nullable } from '~lib/types';

export interface Fradrag {
    type: Fradragstype;
    beløp: number;
    beskrivelse: Nullable<string>;
}

export enum Fradragstype {
    Uføretrygd = 'Uføretrygd',
    Barnetillegg = 'Barnetillegg',
    Arbeidsinntekt = 'Arbeidsinntekt',
    Pensjon = 'Pensjon',
    Kapitalinntekt = 'Kapitalinntekt',
    AndreYtelser = 'AndreYtelser',
}
