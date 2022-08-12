import { getEq } from 'fp-ts/Array';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';

import { eqNullable, Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import {
    FlyktningVilkår,
    VurderingsperiodeFlyktning,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/flyktning/Flyktning';
import { NullablePeriode, Periode } from '~src/types/Periode';
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

export const nyVurderingsperiodeFlyktningMedEllerUtenPeriode = (
    p?: Periode<string>
): VurderingsperioderFlyktningFormData => ({
    periode: p ? lagDatePeriodeAvStringPeriode(p) : lagTomPeriode(),
    resultat: null,
});

export const flyktningVilkårTilFlyktningVilkårFormData = (f: Nullable<FlyktningVilkår>): FlyktningVilkårFormData => {
    return {
        flyktning: f?.vurderinger.map(flyktningVurderingsperiodeTilFormData) ?? [
            nyVurderingsperiodeFlyktningMedEllerUtenPeriode(),
        ],
    };
};

export const flyktningVurderingsperiodeTilFormData = (
    f: VurderingsperiodeFlyktning
): VurderingsperioderFlyktningFormData => ({
    periode: lagDatePeriodeAvStringPeriode(f.periode),
    resultat: f.resultat,
});

export const eqVurderingsperioderFlyktningFormData = struct<VurderingsperioderFlyktningFormData>({
    periode: eqNullable(eqPeriode),
    resultat: eqNullable(S.Eq),
});

export const eqFlyktningVilkårFormData = struct<FlyktningVilkårFormData>({
    flyktning: getEq(eqVurderingsperioderFlyktningFormData),
});

export const flyktningFormSchema = yup.object<FlyktningVilkårFormData>({
    flyktning: yup
        .array<VurderingsperioderFlyktningFormData>(
            yup
                .object<VurderingsperioderFlyktningFormData>({
                    periode: yup
                        .object<NullablePeriode>({
                            fraOgMed: yup.date().required().typeError('Dato må fylles inn'),
                            tilOgMed: yup.date().required().typeError('Dato må fylles inn'),
                        })
                        .required(),
                    resultat: yup.string().nullable().defined().oneOf(Object.values(Vilkårstatus)).required(),
                })
                .required()
        )
        .min(1)
        .required(),
});
