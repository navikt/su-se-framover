export type Statistikkoppløsning = 'UKE' | 'MÅNED' | 'ÅR';

export type SakStatistikkKategori =
    | 'SØKNAD'
    | 'REVURDERING'
    | 'KLAGE'
    | 'STANS'
    | 'GJENOPPTAK'
    | 'REGULERING'
    | 'TILBAKEKREVING';

export type Behandlingstidsmåling =
    | 'TOTAL_BEHANDLINGSTID'
    | 'SAKSBEHANDLING_FØR_ATTESTERING'
    | 'TID_HOS_ATTESTANT'
    | 'TID_ETTER_UNDERKJENNING';

export interface SakStatistikkResponse {
    fraOgMed: string;
    tilOgMed: string;
    oppløsning: Statistikkoppløsning;
    perioder: SakStatistikkPeriode[];
}

export interface SakStatistikkPeriode {
    fraOgMed: string;
    tilOgMed: string;
    antall: SakStatistikkAntall[];
    utfall: SakStatistikkUtfall[];
    beholdning: SakStatistikkStatus[];
    behandlingstid: SakStatistikkBehandlingstid[];
}

export interface SakStatistikkAntall {
    kategori: SakStatistikkKategori;
    sakYtelse: string;
    behandlingAarsak: string | null;
    antall: number;
}

export interface SakStatistikkUtfall {
    kategori: SakStatistikkKategori;
    sakYtelse: string;
    status: string;
    resultat: string | null;
    antall: number;
}

export interface SakStatistikkStatus {
    kategori: SakStatistikkKategori;
    sakYtelse: string;
    status: string;
    antall: number;
}

export interface SakStatistikkBehandlingstid {
    kategori: SakStatistikkKategori;
    sakYtelse: string;
    måling: Behandlingstidsmåling;
    antall: number;
    gjennomsnittMillis: number;
    medianMillis: number;
    nittiendePersentilMillis: number;
}

export interface GenerererStatistikkResponse {
    aggregatId: string;
    status: 'GENERERER';
}

export interface StønadStatistikkResponse {
    fraOgMed: string;
    tilOgMed: string;
    perioder: StønadStatistikkPeriode[];
}

export interface StønadStatistikkPeriode {
    måned: string;
    rader: StønadStatistikkAntall[];
}

export interface StønadStatistikkAntall {
    stønadstype: string;
    vedtakstype: string;
    vedtaksresultat: string;
    stønadsklassifisering: string | null;
    antall: number;
}

export interface SakStatistikkParams {
    fraOgMed: string;
    tilOgMed: string;
    oppløsning: Statistikkoppløsning;
}

export interface StønadStatistikkParams {
    fraOgMed: string;
    tilOgMed: string;
}
