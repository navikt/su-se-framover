import { getEq } from 'fp-ts/Array';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';

import { eqNullable, Nullable } from '~src/lib/types';
import yup, { validerAtNullablePeriodeErUtfylt } from '~src/lib/validering';
import {
    OpplysningspliktBeksrivelse,
    OpplysningspliktVilkår,
    VurderingsperiodeOpplysningsplikt,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/opplysningsplikt/Opplysningsplikt';
import { Periode } from '~src/types/Periode';
import * as DateUtils from '~src/utils/date/dateUtils';
import { eqPeriode, lagDatePeriodeAvStringPeriode, lagTomPeriode } from '~src/utils/periode/periodeUtils';

export interface OpplysningspliktVilkårFormData {
    opplysningsplikt: VurderingsperioderOpplysningspliktFormData[];
}

export interface VurderingsperioderOpplysningspliktFormData {
    periode: {
        fraOgMed: Nullable<Date>;
        tilOgMed: Nullable<Date>;
    };
    beskrivelse: Nullable<OpplysningspliktBeksrivelse>;
}

export const eqVurderingsperioderOpplysningspliktFormData = struct<VurderingsperioderOpplysningspliktFormData>({
    periode: eqNullable(eqPeriode),
    beskrivelse: eqNullable(S.Eq),
});

export const eqOpplysningspliktVilkårFormData = struct<OpplysningspliktVilkårFormData>({
    opplysningsplikt: getEq(eqVurderingsperioderOpplysningspliktFormData),
});

export const OpplysningspliktVilkårTilFormData = (o: OpplysningspliktVilkår): OpplysningspliktVilkårFormData => ({
    opplysningsplikt: o.vurderinger.map(OpplysningspliktVurderingsperiodeTilFormData),
});

export const flyktningVilkårTilFormDataEllerNy = (
    o: Nullable<OpplysningspliktVilkår>,
    p?: Periode<string>,
): OpplysningspliktVilkårFormData =>
    o ? OpplysningspliktVilkårTilFormData(o) : nyOpplysningspliktVilkårMedEllerUtenPeriode(p);

export const OpplysningspliktVurderingsperiodeTilFormData = (
    o: VurderingsperiodeOpplysningsplikt,
): VurderingsperioderOpplysningspliktFormData => ({
    periode: lagDatePeriodeAvStringPeriode(o.periode),
    beskrivelse: o.beskrivelse,
});

export const nyOpplysningspliktVilkårMedEllerUtenPeriode = (p?: Periode<string>): OpplysningspliktVilkårFormData => ({
    opplysningsplikt: [nyVurderingsperiodeOpplysningspliktMedEllerUtenPeriode(p)],
});

export const nyVurderingsperiodeOpplysningspliktMedEllerUtenPeriode = (
    p?: Periode<string>,
): VurderingsperioderOpplysningspliktFormData => ({
    periode: p ? lagDatePeriodeAvStringPeriode(p) : lagTomPeriode(),
    beskrivelse: null,
});

export const opplysningspliktFormDataTilRequest = (args: {
    sakId: string;
    behandlingId: string;
    vilkår: OpplysningspliktVilkårFormData;
}) => ({
    sakId: args.sakId,
    behandlingId: args.behandlingId,
    vurderinger: args.vilkår.opplysningsplikt.map((v) => ({
        periode: {
            fraOgMed: DateUtils.toIsoDateOnlyString(v.periode.fraOgMed!),
            tilOgMed: DateUtils.toIsoDateOnlyString(v.periode.tilOgMed!),
        },
        vurdering: v.beskrivelse!,
    })),
});

export const opplysningspliktFormSchema = yup.object<OpplysningspliktVilkårFormData>({
    opplysningsplikt: yup
        .array<VurderingsperioderOpplysningspliktFormData>(
            yup
                .object<VurderingsperioderOpplysningspliktFormData>({
                    periode: validerAtNullablePeriodeErUtfylt,
                    beskrivelse: yup
                        .string()
                        .nullable()
                        .defined()
                        .oneOf(Object.values(OpplysningspliktBeksrivelse))
                        .required(),
                })
                .required(),
        )
        .min(1)
        .required(),
});
