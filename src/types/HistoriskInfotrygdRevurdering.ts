import { Periode } from '~src/types/Periode';

export type HistoriskInfotrygdRevurderingStatus =
    | 'OPPRETTET'
    | 'BEREGNET'
    | 'TIL_ATTESTERING'
    | 'UNDERKJENT'
    | 'AVSLUTTET';

export interface HistoriskInfotrygdRevurderingRequest {
    fnr: string;
    periode: Periode<string>;
}

export interface HistoriskInfotrygdRevurdering {
    id: string;
    sakId: string;
    periode: Periode<string>;
    status: HistoriskInfotrygdRevurderingStatus;
    versjon: number;
    opprettet: string;
    oppdatert: string;
}

export interface HistoriskInfotrygdAvsluttRequest {
    begrunnelse: string;
}
