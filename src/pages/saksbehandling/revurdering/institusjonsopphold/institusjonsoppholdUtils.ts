import { Nullable } from '~src/lib/types';
import yup, { validateDate } from '~src/lib/validering';
import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';

export interface InstitusjonsoppholdVilkårFormData {
    institusjonsopphold: VurderingsperiodeInstitusjonsoppholdFormData[];
}

export interface VurderingsperiodeInstitusjonsoppholdFormData {
    periode: {
        fraOgMed: Nullable<Date>;
        tilOgMed: Nullable<Date>;
    };
    resultat: Nullable<Vilkårstatus>;
}

export const nyVurderingsperiodeInstitusjonsopphold = (): VurderingsperiodeInstitusjonsoppholdFormData => ({
    periode: {
        fraOgMed: null,
        tilOgMed: null,
    },
    resultat: null,
});

export const institusjonsoppholdFormSchema = yup.object<InstitusjonsoppholdVilkårFormData>({
    institusjonsopphold: yup
        .array<VurderingsperiodeInstitusjonsoppholdFormData>(
            yup
                .object<VurderingsperiodeInstitusjonsoppholdFormData>({
                    periode: validateDate,
                    resultat: yup
                        .string()
                        .nullable()
                        .defined()
                        .oneOf([Vilkårstatus.VilkårOppfylt, Vilkårstatus.VilkårIkkeOppfylt])
                        .required(),
                })
                .required()
        )
        .min(1)
        .required(),
});
