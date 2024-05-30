import { Nullable } from '~src/lib/types';
import { KontrollsamtaleFormStatus } from '~src/pages/kontrollsamtale/KontrollsamtaleUtils';

export interface Kontrollsamtale {
    id: string;
    opprettet: string;
    innkallingsdato: string;
    status: KontrollsamtaleStatus;
    frist: string;
    dokumentId: Nullable<string>;
    journalpostIdKontrollnotat: Nullable<string>;
}

export enum KontrollsamtaleStatus {
    PLANLAGT_INNKALLING = 'PLANLAGT_INNKALLING',
    INNKALT = 'INNKALT',
    GJENNOMFØRT = 'GJENNOMFØRT',
    ANNULLERT = 'ANNULLERT',
    IKKE_MØTT_INNEN_FRIST = 'IKKE_MØTT_INNEN_FRIST',
}

export interface OppdaterKontrollsamtaleRequest {
    sakId: string;
    kontrollsamtaleId: string;
    dato: string;
    journalpostId: Nullable<string>;
    status: KontrollsamtaleFormStatus;
}

export interface AnnullerKontrollsamtaleRequest {
    sakId: string;
    kontrollsamtaleId: string;
}
