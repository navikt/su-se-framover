import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { NullablePeriode } from '~src/types/Periode';

export interface FastOppholdVilkårFormData {
    fastOpphold: VurderingsperiodeFastOppholdFormData[];
}

export interface VurderingsperiodeFastOppholdFormData {
    periode: {
        fraOgMed: Nullable<Date>;
        tilOgMed: Nullable<Date>;
    };
    resultat: Nullable<Vilkårstatus>;
}

export const nyVurderingsperiodeFastOpphold = (): VurderingsperiodeFastOppholdFormData => ({
    periode: {
        fraOgMed: null,
        tilOgMed: null,
    },
    resultat: null,
});

export const fastOppholdFormSchema = yup.object<FastOppholdVilkårFormData>({
    fastOpphold: yup
        .array<VurderingsperiodeFastOppholdFormData>(
            yup
                .object<VurderingsperiodeFastOppholdFormData>({
                    periode: yup
                        .object<NullablePeriode>({
                            fraOgMed: yup.date().required().typeError('Dato må fylles inn!'),
                            tilOgMed: yup.date().required().typeError('Dato må fylles inn!'),
                        })
                        .required(),
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
