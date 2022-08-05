import { Nullable } from '~src/lib/types';
import yup, { validateDate } from '~src/lib/validering';
import { PersonligOppmøteÅrsak } from '~src/types/grunnlagsdataOgVilkårsvurderinger/personligOppmøte/PersonligOppmøte';

export interface PersonligOppmøteVilkårFormData {
    personligOppmøte: VurderingsperiodePersonligOppmøteFormData[];
}

export interface VurderingsperiodePersonligOppmøteFormData {
    periode: {
        fraOgMed: Nullable<Date>;
        tilOgMed: Nullable<Date>;
    };
    møttPersonlig: Nullable<boolean>;
    årsakForManglendePersonligOppmøte: Nullable<PersonligOppmøteÅrsak>;
}

export const nyVurderingsperiodePersonligOppmøte = (): VurderingsperiodePersonligOppmøteFormData => ({
    periode: {
        fraOgMed: null,
        tilOgMed: null,
    },
    møttPersonlig: null,
    årsakForManglendePersonligOppmøte: null,
});

export const toPersonligOppmøteÅrsakInnsending = (
    møttPersonlig: Nullable<boolean>,
    årsak: Nullable<PersonligOppmøteÅrsak>
): Nullable<PersonligOppmøteÅrsak> => {
    console.log(møttPersonlig, årsak);
    if (møttPersonlig) {
        return PersonligOppmøteÅrsak.MøttPersonlig;
    }

    if (årsak === PersonligOppmøteÅrsak.Uavklart || årsak === null) {
        return null;
    }

    return årsak;
};

export const personligOppmøteFormSchema = yup.object<PersonligOppmøteVilkårFormData>({
    personligOppmøte: yup
        .array<VurderingsperiodePersonligOppmøteFormData>(
            yup
                .object<VurderingsperiodePersonligOppmøteFormData>({
                    periode: validateDate,
                    møttPersonlig: yup.boolean().required(),
                    årsakForManglendePersonligOppmøte: yup
                        .string<PersonligOppmøteÅrsak>()
                        .when('møttPersonlig', {
                            is: false,
                            then: yup.string().oneOf(Object.values(PersonligOppmøteÅrsak)).required(),
                        })
                        .defined(),
                })
                .required()
        )
        .min(1)
        .required(),
});
