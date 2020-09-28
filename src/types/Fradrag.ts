import { Nullable } from '~lib/types';

export const ForventetInntektfradrag = 'Forventet inntekt' as const;
export type ForventetInntektfradrag = typeof ForventetInntektfradrag;

export interface Fradrag {
    type: Fradragstype | ForventetInntektfradrag;
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
