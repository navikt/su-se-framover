import { FileObject } from '@navikt/ds-react';

import {
    DokumentDistribusjonFormData,
    dokumentDistribusjonFormSchema,
} from '~src/components/forms/dokument/distribusjon/DokumentDistribusjonFormUtils';
import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { Distribusjonstype } from '~src/types/dokument/Dokument';

export interface DokumentFormData {
    tittel: string;
    vilHellerLasteOppPdf: boolean;
    fritekst: string;
    fileObject: Nullable<FileObject>;
    skalSendeTilAnnenAdresse: boolean;
    adresse: Nullable<DokumentDistribusjonFormData>;
    distribusjonstype: Nullable<Distribusjonstype>;
}

export const dokumentSchema = yup.object<DokumentFormData>({
    tittel: yup.string().required(),
    vilHellerLasteOppPdf: yup.boolean().required(),
    fritekst: yup.string().defined().when('vilHellerLasteOppPdf', {
        is: false,
        then: yup.string().required(),
    }),
    fileObject: yup.mixed<FileObject>().nullable().when('vilHellerLasteOppPdf', {
        is: true,
        then: yup.mixed<FileObject>().required(),
    }),
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
