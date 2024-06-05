import yup from '~src/lib/validering';

export interface DistribuerDokumentFormData {
    dokumentId: string;
    sakId: string;
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

export const distribuerDokumentSchema = yup.object<DistribuerDokumentFormData>({
    dokumentId: yup.string().required(),
    sakId: yup.string().required(),
    adresser: arraySchema,
    postnummer: yup.string().required(),
    poststed: yup.string().required(),
});

export interface DistribuerDokumentRequest {
    dokumentId: string;
    sakId: string;
    adressadresselinje1: string | null;
    adressadresselinje2: string | null;
    adressadresselinje3: string | null;
    postnummer: string;
    poststed: string;
}
