import { v4 as uuid } from 'uuid';

import { Nullable } from '~src/lib/types';
import { UføreResultat, VurderingsperiodeUføre } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { NullablePeriode } from '~src/types/Periode';
import * as DateUtils from '~src/utils/date/dateUtils';

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

export interface FormData {
    grunnlag: UføreperiodeFormData[];
}
