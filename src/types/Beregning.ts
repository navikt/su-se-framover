import * as Array from 'fp-ts/lib/Array';
import { Eq, struct } from 'fp-ts/lib/Eq';
import * as N from 'fp-ts/lib/number';
import * as S from 'fp-ts/lib/string';

import { Nullable } from '~lib/types';

import { Beregningsmerknad } from './Beregningsmerknad';
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
    begrunnelse: Nullable<string>;
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
    merknader: Beregningsmerknad[];
}

export const eqMånedsberegningBortsettFraPeriodeOgMerknad: Eq<Månedsberegning> = struct<
    Omit<Månedsberegning, 'fraOgMed' | 'tilOgMed' | 'merknader'>
>({
    beløp: N.Eq,
    epsFribeløp: N.Eq,
    epsInputFradrag: Array.getEq(eqFradragBortsettFraPeriode),
    fradrag: Array.getEq(eqFradragBortsettFraPeriode),
    grunnbeløp: N.Eq,
    sats: S.Eq,
    satsbeløp: N.Eq,
});
