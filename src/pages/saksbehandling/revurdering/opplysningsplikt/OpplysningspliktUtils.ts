import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { OpplysningspliktBeksrivelse } from '~src/types/grunnlagsdataOgVilkårsvurderinger/opplysningsplikt/Opplysningsplikt';

export interface OpplysningspliktVilkårForm {
    opplysningsplikt: VurderingsperioderOpplysinngspliktFormData[];
}

export interface VurderingsperioderOpplysinngspliktFormData {
    periode: {
        fraOgMed: Nullable<Date>;
        tilOgMed: Nullable<Date>;
    };
    beskrivelse: Nullable<string>;
}

export const schemaValidation = yup.object<OpplysningspliktVilkårForm>({
    opplysningsplikt: yup
        .array<VurderingsperioderOpplysinngspliktFormData>(
            yup
                .object<VurderingsperioderOpplysinngspliktFormData>({
                    beskrivelse: yup
                        .string()
                        .nullable()
                        .defined()
                        .oneOf(Object.values(OpplysningspliktBeksrivelse))
                        .required(),
                    periode: yup
                        .object({
                            fraOgMed: yup.date().required().typeError('Dato må fylles inn'),
                            tilOgMed: yup.date().required().typeError('Dato må fylles inn'),
                        })
                        .required(),
                })
                .required()
        )
        .min(1)
        .required(),
});
