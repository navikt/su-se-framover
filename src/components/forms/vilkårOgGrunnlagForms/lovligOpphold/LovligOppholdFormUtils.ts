import { getEq } from 'fp-ts/Array';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';

import { eqNullable, Nullable } from '~src/lib/types';
import yup, { validerAtNullablePeriodeErUtfylt } from '~src/lib/validering';
import {
    LovligOppholdRequest,
    LovligOppholdVilkår,
    VurderingsperiodeLovligOpphold,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/lovligOpphold/LovligOppholdVilkår';
import { Periode } from '~src/types/Periode';
import { Vilkårstatus } from '~src/types/Vilkår';
import * as DateUtils from '~src/utils/date/dateUtils';
import { eqPeriode, lagDatePeriodeAvStringPeriode, lagTomPeriode } from '~src/utils/periode/periodeUtils';

export interface LovligOppholdVilkårFormData {
    lovligOpphold: VurderingsperioderLovligOppholdFormData[];
}

export interface VurderingsperioderLovligOppholdFormData {
    periode: {
        fraOgMed: Nullable<Date>;
        tilOgMed: Nullable<Date>;
    };
    resultat: Nullable<Vilkårstatus>;
}

export const eqVurderingsperioderLovligOppholdFormData = struct<VurderingsperioderLovligOppholdFormData>({
    periode: eqNullable(eqPeriode),
    resultat: eqNullable(S.Eq),
});

export const eqLovligOppholdVilkårFormData = struct<LovligOppholdVilkårFormData>({
    lovligOpphold: getEq(eqVurderingsperioderLovligOppholdFormData),
});

export const lovligOppholdVilkårTilFormData = (l: LovligOppholdVilkår): LovligOppholdVilkårFormData => ({
    lovligOpphold: l.vurderinger.map(lovligOppholdVurderingsperiodeTilFormData),
});

export const lovligOppholdVilkårTilFormDataEllerNy = (
    f: Nullable<LovligOppholdVilkår>,
    p?: Periode<string>,
): LovligOppholdVilkårFormData => (f ? lovligOppholdVilkårTilFormData(f) : nyFlyktningVilkårMedEllerUtenPeriode(p));

export const lovligOppholdVurderingsperiodeTilFormData = (
    f: VurderingsperiodeLovligOpphold,
): VurderingsperioderLovligOppholdFormData => ({
    periode: lagDatePeriodeAvStringPeriode(f.periode),
    resultat: f.resultat,
});

export const nyFlyktningVilkårMedEllerUtenPeriode = (p?: Periode<string>): LovligOppholdVilkårFormData => ({
    lovligOpphold: [nyVurderingsperiodeLovligOppholdMedEllerUtenPeriode(p)],
});

export const nyVurderingsperiodeLovligOppholdMedEllerUtenPeriode = (
    p?: Periode<string>,
): VurderingsperioderLovligOppholdFormData => ({
    periode: p ? lagDatePeriodeAvStringPeriode(p) : lagTomPeriode(),
    resultat: null,
});

export const lovligOppholdFormDataTilRequest = (args: {
    sakId: string;
    behandlingId: string;
    vilkår: LovligOppholdVilkårFormData;
}): LovligOppholdRequest => ({
    sakId: args.sakId,
    behandlingId: args.behandlingId,
    vurderinger: args.vilkår.lovligOpphold.map((v) => ({
        periode: {
            fraOgMed: DateUtils.toIsoDateOnlyString(v.periode.fraOgMed!),
            tilOgMed: DateUtils.toIsoDateOnlyString(v.periode.tilOgMed!),
        },
        status: v.resultat!,
    })),
});

export const lovligOppholdFormSchema = yup.object<LovligOppholdVilkårFormData>({
    lovligOpphold: yup
        .array<VurderingsperioderLovligOppholdFormData>(
            yup
                .object<VurderingsperioderLovligOppholdFormData>({
                    periode: validerAtNullablePeriodeErUtfylt,
                    resultat: yup.string().nullable().defined().oneOf(Object.values(Vilkårstatus)).required(),
                })
                .required(),
        )
        .min(1)
        .required(),
});
