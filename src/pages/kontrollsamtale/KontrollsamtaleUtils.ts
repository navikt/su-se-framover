import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { KontrollsamtaleStatus } from '~src/types/Kontrollsamtale';

export interface OpprettNyKontrollsamtaleFormData {
    nyKontrollsamtaleDato: Nullable<Date>;
}

export const opprettNyKontrollsamtaleSchema = yup.object<OpprettNyKontrollsamtaleFormData>({
    nyKontrollsamtaleDato: yup.date().required('Dato må være satt'),
});

export enum KontrollsamtaleFormStatus {
    GJENNOMFØRT = 'GJENNOMFØRT',
    IKKE_MØTT_INNEN_FRIST = 'IKKE_MØTT_INNEN_FRIST',
}

export interface OppdaterKontrollsamtaleFormData {
    nyDato: Date;
    journalpostId: string;
    status: Nullable<KontrollsamtaleFormStatus>;
}

export const OppdaterKontrollsamtaleSchema = yup.object<OppdaterKontrollsamtaleFormData>({
    nyDato: yup.date().required('Dato må være satt'),
    journalpostId: yup.string(),
    status: yup.string().oneOf(Object.values(KontrollsamtaleFormStatus)).required('Status må være satt'),
});

export const kontrollsamtaleStatusTextMapper = (status: KontrollsamtaleStatus | KontrollsamtaleFormStatus) => {
    switch (status) {
        case KontrollsamtaleStatus.PLANLAGT_INNKALLING:
            return 'Planlagt innkalling';
        case KontrollsamtaleStatus.INNKALT:
            return 'Innkalt';
        case KontrollsamtaleStatus.GJENNOMFØRT:
        case KontrollsamtaleFormStatus.GJENNOMFØRT:
            return 'Gjennomført';
        case KontrollsamtaleStatus.ANNULLERT:
            return 'Annullert';
        case KontrollsamtaleStatus.IKKE_MØTT_INNEN_FRIST:
        case KontrollsamtaleFormStatus.IKKE_MØTT_INNEN_FRIST:
            return 'Ikke møtt innen frist';
    }
};

export const kontrollsamtalestatusToFormStatus = (
    status: KontrollsamtaleStatus,
): Nullable<KontrollsamtaleFormStatus> => {
    switch (status) {
        case KontrollsamtaleStatus.PLANLAGT_INNKALLING:
            return null;
        case KontrollsamtaleStatus.INNKALT:
            return null;
        case KontrollsamtaleStatus.GJENNOMFØRT:
            return KontrollsamtaleFormStatus.GJENNOMFØRT;
        case KontrollsamtaleStatus.ANNULLERT:
            return null;
        case KontrollsamtaleStatus.IKKE_MØTT_INNEN_FRIST:
            return KontrollsamtaleFormStatus.IKKE_MØTT_INNEN_FRIST;
    }
};
