import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';

export interface LovligOppholdVilkårForm {
    lovligOpphold: VurderingsperioderLovligoppholdFormData[];
}

export interface VurderingsperioderLovligoppholdFormData {
    periode: {
        fraOgMed: Nullable<Date>;
        tilOgMed: Nullable<Date>;
    };
    resultat: Nullable<Vilkårstatus>;
}

export const getTomVurderingsperiodeLovligOpphold = (): VurderingsperioderLovligoppholdFormData => {
    return {
        periode: {
            fraOgMed: null,
            tilOgMed: null,
        },
        resultat: null,
    };
};

export const lovligOppholdSchemaValidation = yup.object<LovligOppholdVilkårForm>({
    lovligOpphold: yup
        .array<VurderingsperioderLovligoppholdFormData>(
            yup
                .object<VurderingsperioderLovligoppholdFormData>({
                    resultat: yup.string().nullable().defined().oneOf(Object.values(Vilkårstatus)).required(),
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
