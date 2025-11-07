import { getEq } from 'fp-ts/Array';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';

import { eqNullable, Nullable } from '~src/lib/types';
import yup, { validerAtNullablePeriodeErUtfylt } from '~src/lib/validering';
import {
    FastOppholdVilkår,
    FastOppholdVilkårRequest,
    VurderingsperiodeFastOpphold,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/fastOpphold/FastOppholdVilkår';
import { Periode } from '~src/types/Periode';
import { Vilkårstatus } from '~src/types/Vilkår';
import * as DateUtils from '~src/utils/date/dateUtils';
import { eqPeriode, lagDatePeriodeAvStringPeriode, lagTomPeriode } from '~src/utils/periode/periodeUtils';

export interface FastOppholdVilkårFormData {
    fastOpphold: VurderingsperioderFastOppholdFormData[];
}

export interface VurderingsperioderFastOppholdFormData {
    periode: {
        fraOgMed: Nullable<Date>;
        tilOgMed: Nullable<Date>;
    };
    resultat: Nullable<Vilkårstatus>;
}

const eqVurderingsperioderFastOppholdFormData = struct<VurderingsperioderFastOppholdFormData>({
    periode: eqNullable(eqPeriode),
    resultat: eqNullable(S.Eq),
});

export const eqFastOppholdVilkårFormData = struct<FastOppholdVilkårFormData>({
    fastOpphold: getEq(eqVurderingsperioderFastOppholdFormData),
});

const fastOppholdVilkårTilFormData = (f: FastOppholdVilkår): FastOppholdVilkårFormData => ({
    fastOpphold: f.vurderinger.map(fastOppholdVurderingsperiodeTilFormData),
});

export const fastOppholdVilkårTilFormDataEllerNy = (
    f: Nullable<FastOppholdVilkår>,
    p?: Periode<string>,
): FastOppholdVilkårFormData => (f ? fastOppholdVilkårTilFormData(f) : nyFastOppholdVilkårMedEllerUtenPeriode(p));

const fastOppholdVurderingsperiodeTilFormData = (
    f: VurderingsperiodeFastOpphold,
): VurderingsperioderFastOppholdFormData => ({
    periode: lagDatePeriodeAvStringPeriode(f.periode),
    resultat: f.resultat,
});

const nyFastOppholdVilkårMedEllerUtenPeriode = (p?: Periode<string>): FastOppholdVilkårFormData => ({
    fastOpphold: [nyVurderingsperiodeFastOppholdMedEllerUtenPeriode(p)],
});

export const nyVurderingsperiodeFastOppholdMedEllerUtenPeriode = (
    p?: Periode<string>,
): VurderingsperioderFastOppholdFormData => ({
    periode: p ? lagDatePeriodeAvStringPeriode(p) : lagTomPeriode(),
    resultat: null,
});

export const fastOppholdFormDataTilRequest = (args: {
    sakId: string;
    behandlingId: string;
    vilkår: FastOppholdVilkårFormData;
}): FastOppholdVilkårRequest => ({
    sakId: args.sakId,
    behandlingId: args.behandlingId,
    vurderinger: args.vilkår.fastOpphold.map((v) => ({
        periode: {
            fraOgMed: DateUtils.toIsoDateOnlyString(v.periode.fraOgMed!),
            tilOgMed: DateUtils.toIsoDateOnlyString(v.periode.tilOgMed!),
        },
        vurdering: v.resultat!,
    })),
});

export const fastOppholdFormSchema = yup.object<FastOppholdVilkårFormData>({
    fastOpphold: yup
        .array<VurderingsperioderFastOppholdFormData>(
            yup
                .object<VurderingsperioderFastOppholdFormData>({
                    periode: validerAtNullablePeriodeErUtfylt,
                    resultat: yup.string().nullable().defined().oneOf(Object.values(Vilkårstatus)).required(),
                })
                .required(),
        )
        .min(1)
        .required(),
});
