import {
    DokumentDistribusjonFormData,
    dokumentDistribusjonFormSchema,
} from '~src/components/forms/dokument/distribusjon/DokumentDistribusjonFormUtils';
import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';

export interface DokumentFormData {
    tittel: string;
    fritekst: string;
    skalSendeTilAnnenAdresse: boolean;
    adresse: Nullable<DokumentDistribusjonFormData>;
}

export const dokumentSchema = yup.object<DokumentFormData>({
    tittel: yup.string().required(),
    fritekst: yup.string().required(),
    skalSendeTilAnnenAdresse: yup.boolean().required(),
    adresse: yup.object<DokumentDistribusjonFormData>().nullable().defined().when('skalSendeTilAnnenAdresse', {
        is: true,
        then: dokumentDistribusjonFormSchema,
    }),
});
