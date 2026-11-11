import * as FpArray from 'fp-ts/lib/Array';
import { Eq, struct } from 'fp-ts/lib/Eq';
import * as N from 'fp-ts/lib/number';
import * as S from 'fp-ts/lib/string';

import { eqNullable, Nullable } from '~src/lib/types';

import { eqFradragBortsettFraPeriode, Fradrag } from './Fradrag';
import { Sats } from './Sats';

export interface Beregning {
    id: string;
    opprettet: string;
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
    forventetInntektSammenligning: Nullable<ForventetInntektSammenligning>;
}

export interface ForventetInntektSammenligning {
    forventetInntekt: number;
    arbeidsinntekterEtterLoven: number;
    inntekterISammenligningen: Fradrag[];
    benyttetFradrag: 'FORVENTET_INNTEKT' | 'ARBEIDSINNTEKTER';
}

export const sammenligningMedNoeValgtBort = (
    sammenligning: Nullable<ForventetInntektSammenligning>,
): Nullable<ForventetInntektSammenligning> =>
    sammenligning !== null && sammenligning.inntekterISammenligningen.length > 0 ? sammenligning : null;

const eqForventetInntektSammenligning = struct<ForventetInntektSammenligning>({
    forventetInntekt: N.Eq,
    arbeidsinntekterEtterLoven: N.Eq,
    inntekterISammenligningen: FpArray.getEq(eqFradragBortsettFraPeriode),
    benyttetFradrag: S.Eq,
});

export const eqMånedsberegningBortsettFraPeriode: Eq<Månedsberegning> = struct<
    Omit<Månedsberegning, 'fraOgMed' | 'tilOgMed'>
>({
    beløp: N.Eq,
    epsFribeløp: N.Eq,
    epsInputFradrag: FpArray.getEq(eqFradragBortsettFraPeriode),
    fradrag: FpArray.getEq(eqFradragBortsettFraPeriode),
    grunnbeløp: N.Eq,
    sats: S.Eq,
    satsbeløp: N.Eq,
    forventetInntektSammenligning: eqNullable(eqForventetInntektSammenligning),
});
