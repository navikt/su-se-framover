import { getEq } from 'fp-ts/Array';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';
import { v4 as uuid } from 'uuid';

import { eqNullable, Nullable } from '~src/lib/types';
import { UføreResultat, VurderingsperiodeUføre } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { NullablePeriode, Periode } from '~src/types/Periode';
import * as DateUtils from '~src/utils/date/dateUtils';
import { eqPeriode, lagDatePeriodeAvStringPeriodeEllerTomPeriode } from '~src/utils/periode/periodeUtils';

export const eqUføreperiodeFormData = struct<UføreperiodeFormData>({
    id: S.Eq,
    periode: eqPeriode,
    uføregrad: S.Eq,
    forventetInntekt: S.Eq,
    oppfylt: eqNullable(S.Eq),
});

export const eqUføreVilkårFormData = struct<UførhetFormData>({
    grunnlag: getEq(eqUføreperiodeFormData),
});

export const lagTomUføreperiode = (periode?: Periode<string>): UføreperiodeFormData => ({
    id: uuid(),
    periode: lagDatePeriodeAvStringPeriodeEllerTomPeriode(periode),
    forventetInntekt: '',
    oppfylt: null,
    uføregrad: '',
});

export const vurderingsperiodeTilFormData = (u: VurderingsperiodeUføre): UføreperiodeFormData => ({
    id: uuid(),
    periode: {
        fraOgMed: DateUtils.parseIsoDateOnly(u.periode.fraOgMed),
        tilOgMed: DateUtils.parseIsoDateOnly(u.periode.tilOgMed),
    },
    uføregrad: u.grunnlag?.uføregrad.toString() ?? '',
    forventetInntekt: u.grunnlag?.forventetInntekt.toString() ?? '',
    oppfylt: u.resultat,
});

export interface UføreperiodeFormData {
    id: string;
    periode: NullablePeriode;
    uføregrad: string;
    forventetInntekt: string;
    oppfylt: Nullable<UføreResultat>;
}

export interface UførhetFormData {
    grunnlag: UføreperiodeFormData[];
}
