import { struct } from 'fp-ts/lib/Eq';
import * as N from 'fp-ts/lib/number';
import * as S from 'fp-ts/lib/string';

import { eqNullable, Nullable } from '~lib/types';

export interface Fradrag {
    periode: Nullable<Periode<string>>;
    type: Fradragstype;
    beløp: number;
    utenlandskInntekt: Nullable<UtenlandskInntekt>;
    tilhører: FradragTilhører;
}

const eqUtenlandskInntekt = struct<UtenlandskInntekt>({
    beløpIUtenlandskValuta: N.Eq,
    kurs: N.Eq,
    valuta: S.Eq,
});

export const eqFradragBortsettFraPeriode = struct<Omit<Fradrag, 'periode'>>({
    type: S.Eq,
    beløp: N.Eq,
    utenlandskInntekt: eqNullable(eqUtenlandskInntekt),
    tilhører: S.Eq,
});

export interface Periode<T = Date> {
    fraOgMed: T;
    tilOgMed: T;
}

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
