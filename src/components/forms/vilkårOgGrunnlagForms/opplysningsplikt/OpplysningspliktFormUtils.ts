import { Nullable } from '~src/lib/types';
import yup, { validerAtNullablePeriodeErUtfylt } from '~src/lib/validering';
import { OpplysningspliktBeksrivelse } from '~src/types/grunnlagsdataOgVilkårsvurderinger/opplysningsplikt/Opplysningsplikt';
import { Periode } from '~src/types/Periode';
import { lagDatePeriodeAvStringPeriode, lagTomPeriode } from '~src/utils/periode/periodeUtils';

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

export const nyVurderingsperiodeOpplysningspliktMedEllerUtenPeriode = (
    p?: Periode<string>,
): VurderingsperioderOpplysningspliktFormData => ({
    periode: p ? lagDatePeriodeAvStringPeriode(p) : lagTomPeriode(),
    beskrivelse: null,
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
