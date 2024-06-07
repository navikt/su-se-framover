import {
    DokumentDistribusjonFormData,
    dokumentDistribusjonFormSchema,
} from '~src/components/forms/dokument/distribusjon/DokumentDistribusjonFormUtils';
import yup from '~src/lib/validering';

export interface DistribuerDokumentFormData {
    sakId: string;
    dokumentId: string;
    distribusjon: DokumentDistribusjonFormData;
}

export const distribuerDokumentSchema = yup.object<DistribuerDokumentFormData>({
    dokumentId: yup.string().required(),
    sakId: yup.string().required(),
    distribusjon: dokumentDistribusjonFormSchema.required(),
});

export interface DistribuerDokumentRequest {
    dokumentId: string;
    sakId: string;
    adressadresselinje1: string;
    adressadresselinje2: string | null;
    adressadresselinje3: string | null;
    postnummer: string;
    poststed: string;
}
