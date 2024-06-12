import {
    DokumentDistribusjonFormData,
    dokumentDistribusjonFormSchema,
} from '~src/components/forms/dokument/distribusjon/DokumentDistribusjonFormUtils';
import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { Distribusjonstype } from '~src/types/dokument/Dokument';

export interface DokumentFormData {
    tittel: string;
    fritekst: string;
    skalSendeTilAnnenAdresse: boolean;
    adresse: Nullable<DokumentDistribusjonFormData>;
    distribusjonstype: Nullable<Distribusjonstype>;
}

export const dokumentSchema = yup.object<DokumentFormData>({
    tittel: yup.string().required(),
    fritekst: yup.string().required(),
    skalSendeTilAnnenAdresse: yup.boolean().required(),
    adresse: yup.object<DokumentDistribusjonFormData>().nullable().defined().when('skalSendeTilAnnenAdresse', {
        is: true,
        then: dokumentDistribusjonFormSchema,
    }),
    distribusjonstype: yup
        .string()
        .nullable()
        .oneOf(Object.values(Object.values(Distribusjonstype)))
        .required(),
});

export const distribusjonstypeTextMapper = (d: Distribusjonstype) => {
    switch (d) {
        case Distribusjonstype.VIKTIG:
            return 'Viktig';
        case Distribusjonstype.VEDTAK:
            return 'Vedtak';
        case Distribusjonstype.ANNET:
            return 'Annet';
    }
};
