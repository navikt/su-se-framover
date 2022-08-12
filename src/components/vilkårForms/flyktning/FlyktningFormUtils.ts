import { getEq } from 'fp-ts/Array';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';

import { eqNullable, Nullable } from '~src/lib/types';
import yup, { validateDate } from '~src/lib/validering';
import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import {
    FlyktningVilkår,
    VurderingsperiodeFlyktning,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/flyktning/Flyktning';
import { Periode } from '~src/types/Periode';
import * as DateUtils from '~src/utils/date/dateUtils';
import { eqPeriode, lagDatePeriodeAvStringPeriode, lagTomPeriode } from '~src/utils/periode/periodeUtils';

export interface FlyktningVilkårFormData {
    flyktning: VurderingsperioderFlyktningFormData[];
}

export interface VurderingsperioderFlyktningFormData {
    periode: {
        fraOgMed: Nullable<Date>;
        tilOgMed: Nullable<Date>;
    };
    resultat: Nullable<Vilkårstatus>;
}

export const eqVurderingsperioderFlyktningFormData = struct<VurderingsperioderFlyktningFormData>({
    periode: eqNullable(eqPeriode),
    resultat: eqNullable(S.Eq),
});

export const eqFlyktningVilkårFormData = struct<FlyktningVilkårFormData>({
    flyktning: getEq(eqVurderingsperioderFlyktningFormData),
});

export const flyktningVilkårTilFormData = (f: FlyktningVilkår): FlyktningVilkårFormData => ({
    flyktning: f.vurderinger.map(flyktningVurderingsperiodeTilFormData),
});

export const flyktningVilkårTilFormDataEllerNy = (
    f: Nullable<FlyktningVilkår>,
    p?: Periode<string>
): FlyktningVilkårFormData => (f ? flyktningVilkårTilFormData(f) : nyFlyktningVilkårMedEllerUtenPeriode(p));

export const flyktningVurderingsperiodeTilFormData = (
    f: VurderingsperiodeFlyktning
): VurderingsperioderFlyktningFormData => ({
    periode: lagDatePeriodeAvStringPeriode(f.periode),
    resultat: f.resultat,
});

export const nyFlyktningVilkårMedEllerUtenPeriode = (p?: Periode<string>): FlyktningVilkårFormData => ({
    flyktning: [nyVurderingsperiodeFlyktningMedEllerUtenPeriode(p)],
});

export const nyVurderingsperiodeFlyktningMedEllerUtenPeriode = (
    p?: Periode<string>
): VurderingsperioderFlyktningFormData => ({
    periode: p ? lagDatePeriodeAvStringPeriode(p) : lagTomPeriode(),
    resultat: null,
});

export const flyktningFormDataTilRequest = (args: {
    sakId: string;
    behandlingId: string;
    vilkår: FlyktningVilkårFormData;
}) => ({
    sakId: args.sakId,
    behandlingId: args.behandlingId,
    vurderinger: args.vilkår.flyktning.map((v) => ({
        periode: {
            fraOgMed: DateUtils.toIsoDateOnlyString(v.periode.fraOgMed!),
            tilOgMed: DateUtils.toIsoDateOnlyString(v.periode.tilOgMed!),
        },
        vurdering: v.resultat!,
    })),
});

export const flyktningFormSchema = yup.object<FlyktningVilkårFormData>({
    flyktning: yup
        .array<VurderingsperioderFlyktningFormData>(
            yup
                .object<VurderingsperioderFlyktningFormData>({
                    periode: validateDate,
                    resultat: yup.string().nullable().defined().oneOf(Object.values(Vilkårstatus)).required(),
                })
                .required()
        )
        .min(1)
        .required(),
});
