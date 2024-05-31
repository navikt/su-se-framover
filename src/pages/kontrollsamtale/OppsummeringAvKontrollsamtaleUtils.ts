import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';

export enum KontrollsamtaleFormStatus {
    GJENNOMFØRT = 'GJENNOMFØRT',
    IKKE_MØTT_INNEN_FRIST = 'IKKE_MØTT_INNEN_FRIST',
}

export interface OppdaterKontrollsamtaleStatusOgJournalpostIdFormData {
    status: Nullable<KontrollsamtaleFormStatus>;
    journalpostId: string;
}

export const oppdaterKontrollsamtaleStatusOgJournalpostIdFormDataSchema =
    yup.object<OppdaterKontrollsamtaleStatusOgJournalpostIdFormData>({
        status: yup.string().oneOf(Object.values(KontrollsamtaleFormStatus)).required('Status må være satt'),
        journalpostId: yup.string(),
    });

export interface OppdaterKontrollsamtaleInnkallingsdato {
    innkallingsmåned: Nullable<Date>;
}

export const oppdaterKontrollsamtaleInnkallingsdatoSchema = yup.object<OppdaterKontrollsamtaleInnkallingsdato>({
    innkallingsmåned: yup.date().required('Innkallingsdato må være satt'),
});
