import { KontrollsamtaleFormStatus } from '~src/components/oppsummering/kontrollsamtale/OppsummeringAvKontrollsamtaleUtils';
import { Nullable } from '~src/lib/types';

export interface Kontrollsamtale {
    id: string;
    opprettet: string;
    innkallingsdato: string;
    status: KontrollsamtaleStatus;
    frist: string;
    dokumentId: Nullable<string>;
    journalpostIdKontrollnotat: Nullable<string>;
    kanOppdatereInnkallingsmåned: boolean;
    lovligeStatusovergangerForSaksbehandler: KontrollsamtaleStatus[];
}

export enum KontrollsamtaleStatus {
    PLANLAGT_INNKALLING = 'PLANLAGT_INNKALLING',
    INNKALT = 'INNKALT',
    GJENNOMFØRT = 'GJENNOMFØRT',
    ANNULLERT = 'ANNULLERT',
    IKKE_MØTT_INNEN_FRIST = 'IKKE_MØTT_INNEN_FRIST',
}

export interface OppdaterKontrollsamtaleStatusOgJournalpostRequest {
    sakId: string;
    kontrollsamtaleId: string;
    status: KontrollsamtaleFormStatus;
    journalpostId: Nullable<string>;
}

export interface OppdaterKontrollsamtaleInnkallingsdatoRequest {
    sakId: string;
    kontrollsamtaleId: string;
    innkallingsmåned: string;
}

export interface AnnullerKontrollsamtaleRequest {
    sakId: string;
    kontrollsamtaleId: string;
}
