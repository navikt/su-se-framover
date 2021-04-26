import { eqNumber, eqString, getStructEq } from 'fp-ts/lib/Eq';

import { eqNullable, Nullable } from '~lib/types';

import { Periode } from './Periode';

export interface Fradrag {
    periode: Nullable<Periode<string>>;
    type: Fradragstype;
    beløp: number;
    utenlandskInntekt: Nullable<UtenlandskInntekt>;
    tilhører: FradragTilhører;
}

const eqUtenlandskInntekt = getStructEq<UtenlandskInntekt>({
    beløpIUtenlandskValuta: eqNumber,
    kurs: eqNumber,
    valuta: eqString,
});

export const eqFradragBortsettFraPeriode = getStructEq<Omit<Fradrag, 'periode'>>({
    type: eqString,
    beløp: eqNumber,
    utenlandskInntekt: eqNullable(eqUtenlandskInntekt),
    tilhører: eqString,
});

export interface UtenlandskInntekt {
    beløpIUtenlandskValuta: number;
    valuta: string;
    kurs: number;
}

export enum FradragTilhører {
    Bruker = 'BRUKER',
    EPS = 'EPS',
}

export enum Fradragstype {
    NAVytelserTilLivsopphold = 'NAVytelserTilLivsopphold',
    Arbeidsinntekt = 'Arbeidsinntekt',
    OffentligPensjon = 'OffentligPensjon',
    PrivatPensjon = 'PrivatPensjon',
    Sosialstønad = 'Sosialstønad',
    Kontantstøtte = 'Kontantstøtte',
    Introduksjonsstønad = 'Introduksjonsstønad',
    Kvalifiseringsstønad = 'Kvalifiseringsstønad',
    BidragEtterEkteskapsloven = 'BidragEtterEkteskapsloven',
    Kapitalinntekt = 'Kapitalinntekt',
    ForventetInntekt = 'ForventetInntekt',
    BeregnetFradragEPS = 'BeregnetFradragEPS',
    UnderMinstenivå = 'UnderMinstenivå',
}
