import { getEq } from 'fp-ts/Array';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';

import { eqNullable, Nullable } from '~src/lib/types';
import yup, { validerAtNullablePeriodeErUtfylt } from '~src/lib/validering';
import {
    UtenlandsoppholdRequest,
    UtenlandsoppholdVilkår,
    utenlandsoppholdStatusTilVilkårStatus,
    VurderingsperiodeUtenlandsopphold,
    vilkårStatusTilUtenlandsoppholdStatus,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { Periode } from '~src/types/Periode';
import { Vilkårstatus } from '~src/types/Vilkår';
import * as DateUtils from '~src/utils/date/dateUtils';
import { eqPeriode, lagDatePeriodeAvStringPeriode, lagTomPeriode } from '~src/utils/periode/periodeUtils';

export interface UtenlandsoppholdVilkårFormData {
    utenlandsopphold: VurderingsperioderUtenlandsoppholdFormData[];
}

export interface VurderingsperioderUtenlandsoppholdFormData {
    periode: {
        fraOgMed: Nullable<Date>;
        tilOgMed: Nullable<Date>;
    };
    resultat: Nullable<Vilkårstatus>;
}

export const eqVurderingsperioderUtenlandsoppholdFormData = struct<VurderingsperioderUtenlandsoppholdFormData>({
    periode: eqNullable(eqPeriode),
    resultat: eqNullable(S.Eq),
});

export const eqUtenlandsoppholdVilkårFormData = struct<UtenlandsoppholdVilkårFormData>({
    utenlandsopphold: getEq(eqVurderingsperioderUtenlandsoppholdFormData),
});

export const utenlandsoppholdVilkårTilFormData = (f: UtenlandsoppholdVilkår): UtenlandsoppholdVilkårFormData => ({
    utenlandsopphold: f.vurderinger.map(UtenlandsoppholdVurderingsperiodeTilFormData),
});

export const utenlandsoppholdVilkårTilFormDataEllerNy = (
    f: Nullable<UtenlandsoppholdVilkår>,
    p?: Periode<string>,
): UtenlandsoppholdVilkårFormData =>
    f ? utenlandsoppholdVilkårTilFormData(f) : nyUtenlandsoppholdVilkårMedEllerUtenPeriode(p);

export const UtenlandsoppholdVurderingsperiodeTilFormData = (
    f: VurderingsperiodeUtenlandsopphold,
): VurderingsperioderUtenlandsoppholdFormData => ({
    periode: lagDatePeriodeAvStringPeriode(f.periode),
    resultat: utenlandsoppholdStatusTilVilkårStatus(f.status),
});

export const nyUtenlandsoppholdVilkårMedEllerUtenPeriode = (p?: Periode<string>): UtenlandsoppholdVilkårFormData => ({
    utenlandsopphold: [nyVurderingsperiodeUtenlandsoppholdMedEllerUtenPeriode(p)],
});

export const nyVurderingsperiodeUtenlandsoppholdMedEllerUtenPeriode = (
    p?: Periode<string>,
): VurderingsperioderUtenlandsoppholdFormData => ({
    periode: p ? lagDatePeriodeAvStringPeriode(p) : lagTomPeriode(),
    resultat: null,
});

export const utenlandsoppholdFormDataTilRequest = (args: {
    sakId: string;
    behandlingId: string;
    vilkår: UtenlandsoppholdVilkårFormData;
}): UtenlandsoppholdRequest => ({
    sakId: args.sakId,
    behandlingId: args.behandlingId,
    utenlandsopphold: args.vilkår.utenlandsopphold.map((v) => ({
        periode: {
            fraOgMed: DateUtils.toIsoDateOnlyString(v.periode.fraOgMed!),
            tilOgMed: DateUtils.toIsoDateOnlyString(v.periode.tilOgMed!),
        },
        status: vilkårStatusTilUtenlandsoppholdStatus(v.resultat!),
    })),
});

export const utenlandsoppholdFormSchema = yup.object<UtenlandsoppholdVilkårFormData>({
    utenlandsopphold: yup
        .array<VurderingsperioderUtenlandsoppholdFormData>(
            yup
                .object<VurderingsperioderUtenlandsoppholdFormData>({
                    periode: validerAtNullablePeriodeErUtfylt,
                    resultat: yup.string().nullable().defined().oneOf(Object.values(Vilkårstatus)).required(),
                })
                .required(),
        )
        .min(1)
        .required(),
});
