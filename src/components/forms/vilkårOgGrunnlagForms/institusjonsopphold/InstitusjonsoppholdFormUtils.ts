import { getEq } from 'fp-ts/Array';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';

import { eqNullable, Nullable } from '~src/lib/types';
import yup, { validerAtNullablePeriodeErUtfylt } from '~src/lib/validering';
import {
    InstitusjonsoppholdVilkår,
    InstitusjonsoppholdVilkårRequest,
    VurderingsperiodeInstitusjonsopphold,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/institusjonsopphold/Institusjonsopphold';
import { Periode } from '~src/types/Periode';
import { Vilkårstatus } from '~src/types/Vilkår';
import * as DateUtils from '~src/utils/date/dateUtils';
import { eqPeriode, lagDatePeriodeAvStringPeriode, lagTomPeriode } from '~src/utils/periode/periodeUtils';

export interface InstitusjonsoppholdVilkårFormData {
    institusjonsopphold: VurderingsperioderInstitusjonsoppholdFormData[];
}

export interface VurderingsperioderInstitusjonsoppholdFormData {
    periode: {
        fraOgMed: Nullable<Date>;
        tilOgMed: Nullable<Date>;
    };
    resultat: Nullable<Vilkårstatus>;
}

const eqVurderingsperioderInstitusjonsoppholdFormData = struct<VurderingsperioderInstitusjonsoppholdFormData>({
    periode: eqNullable(eqPeriode),
    resultat: eqNullable(S.Eq),
});

export const eqInstitusjonsoppholdFormData = struct<InstitusjonsoppholdVilkårFormData>({
    institusjonsopphold: getEq(eqVurderingsperioderInstitusjonsoppholdFormData),
});

const institusjonsoppholdVilkårTilFormData = (i: InstitusjonsoppholdVilkår): InstitusjonsoppholdVilkårFormData => ({
    institusjonsopphold: i.vurderingsperioder.map(institusjonsoppholdVurderingsperiodeTilFormData),
});

export const institusjonsoppholdVilkårTilFormDataEllerNy = (
    i: Nullable<InstitusjonsoppholdVilkår>,
    p?: Periode<string>,
): InstitusjonsoppholdVilkårFormData =>
    i ? institusjonsoppholdVilkårTilFormData(i) : nyInstitusjonsoppholdVilkårMedEllerUtenPeriode(p);

const institusjonsoppholdVurderingsperiodeTilFormData = (
    f: VurderingsperiodeInstitusjonsopphold,
): VurderingsperioderInstitusjonsoppholdFormData => ({
    periode: lagDatePeriodeAvStringPeriode(f.periode),
    resultat: f.vurdering,
});

const nyInstitusjonsoppholdVilkårMedEllerUtenPeriode = (p?: Periode<string>): InstitusjonsoppholdVilkårFormData => ({
    institusjonsopphold: [nyVurderingsperiodeInstitusjonsoppholdMedEllerUtenPeriode(p)],
});

export const nyVurderingsperiodeInstitusjonsoppholdMedEllerUtenPeriode = (
    p?: Periode<string>,
): VurderingsperioderInstitusjonsoppholdFormData => ({
    periode: p ? lagDatePeriodeAvStringPeriode(p) : lagTomPeriode(),
    resultat: null,
});

export const institusjonsoppholdFormDataTilRequest = (args: {
    sakId: string;
    behandlingId: string;
    vilkår: InstitusjonsoppholdVilkårFormData;
}): InstitusjonsoppholdVilkårRequest => ({
    sakId: args.sakId,
    behandlingId: args.behandlingId,
    vurderingsperioder: args.vilkår.institusjonsopphold.map((v) => ({
        periode: {
            fraOgMed: DateUtils.toIsoDateOnlyString(v.periode.fraOgMed!),
            tilOgMed: DateUtils.toIsoDateOnlyString(v.periode.tilOgMed!),
        },
        vurdering: v.resultat!,
    })),
});

export const institusjonsoppholdFormSchema = yup.object<InstitusjonsoppholdVilkårFormData>({
    institusjonsopphold: yup
        .array<VurderingsperioderInstitusjonsoppholdFormData>(
            yup
                .object<VurderingsperioderInstitusjonsoppholdFormData>({
                    periode: validerAtNullablePeriodeErUtfylt,
                    resultat: yup.string().nullable().defined().oneOf(Object.values(Vilkårstatus)).required(),
                })
                .required(),
        )
        .min(1)
        .required(),
});
