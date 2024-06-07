import yup from '~src/lib/validering';

export interface DokumentDistribusjonFormData {
    adresser: Array<{ adresselinje: string }>;
    postnummer: string;
    poststed: string;
}

const arraySchema = yup
    .array()
    .of(
        yup
            .object<{ adresselinje: string }>({
                adresselinje: yup.string().required(),
            })
            .defined(),
    )
    .min(1)
    .required() as yup.ArraySchema<{ adresselinje: string }, object>;

export const dokumentDistribusjonFormSchema = yup.object<DokumentDistribusjonFormData>({
    adresser: arraySchema,
    postnummer: yup.string().required(),
    poststed: yup.string().required(),
});
