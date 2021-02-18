import * as Array from 'fp-ts/lib/Array';
import { Eq, eqNumber, eqString, getStructEq } from 'fp-ts/lib/Eq';

import { Fradrag, eqFradragBortsettFraPeriode } from './Fradrag';
import { Sats } from './Sats';

export interface Beregning {
    id: string;
    opprettet: string;
    sats: Sats;
    fraOgMed: string;
    tilOgMed: string;
    månedsberegninger: Månedsberegning[];
    fradrag: Fradrag[];
}

export interface Månedsberegning {
    sats: Sats;
    beløp: number;
    grunnbeløp: number;
    fraOgMed: string;
    tilOgMed: string;
    fradrag: Fradrag[];
    satsbeløp: number;
    epsFribeløp: number;
    epsInputFradrag: Fradrag[];
}

export const eqMånedsberegningBortsettFraPeriode: Eq<Månedsberegning> = getStructEq<
    Omit<Månedsberegning, 'fraOgMed' | 'tilOgMed'>
>({
    beløp: eqNumber,
    epsFribeløp: eqNumber,
    epsInputFradrag: Array.getEq(eqFradragBortsettFraPeriode),
    fradrag: Array.getEq(eqFradragBortsettFraPeriode),
    grunnbeløp: eqNumber,
    sats: eqString,
    satsbeløp: eqNumber,
});
