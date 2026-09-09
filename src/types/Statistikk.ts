export type Statistikkoppløsning = 'UKE' | 'MÅNED' | 'ÅR';

export type SakStatistikkKategori = 'SØKNAD' | 'REVURDERING' | 'KLAGE' | 'STANS' | 'GJENOPPTAK' | 'TILBAKEKREVING';

export type Behandlingstidsmåling =
    | 'TOTAL_BEHANDLINGSTID'
    | 'SAKSBEHANDLING_FØR_ATTESTERING'
    | 'TID_HOS_ATTESTANT'
    | 'TID_ETTER_UNDERKJENNING';

export interface SakStatistikkMetadata {
    aggregatversjon: number;
    maksSekvensId: number | null;
    sisteHendelseTidspunkt: string | null;
    antallBehandlinger: number;
    behandlingerMedFlereUtfall: number;
}

export type Beholdningsaldersmåling = 'BEHANDLINGENS_ALDER' | 'TID_I_NÅVÆRENDE_STATUS';

export type Beholdningsaldersintervall = 'DAGER_0_7' | 'DAGER_8_30' | 'DAGER_31_60' | 'DAGER_61_90' | 'OVER_90_DAGER';

export interface SakStatistikkResponse {
    fraOgMed: string;
    tilOgMed: string;
    oppløsning: Statistikkoppløsning;
    metadata: SakStatistikkMetadata;
    perioder: SakStatistikkPeriode[];
    kohorter: SakStatistikkKohort[];
}

export interface SakStatistikkPeriode {
    fraOgMed: string;
    tilOgMed: string;
    antall: SakStatistikkAntall[];
    utfall: SakStatistikkUtfall[];
    beholdning: SakStatistikkStatus[];
    behandlingstid: SakStatistikkBehandlingstid[];
    beholdningsalder: SakStatistikkBeholdningsalder[];
    omarbeid: SakStatistikkOmarbeid[];
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

export interface SakStatistikkBeholdningsalder {
    kategori: SakStatistikkKategori;
    sakYtelse: string;
    status: string;
    måling: Beholdningsaldersmåling;
    intervall: Beholdningsaldersintervall;
    antall: number;
}

export interface SakStatistikkOmarbeid {
    kategori: SakStatistikkKategori;
    sakYtelse: string;
    behandlingerMedUtfall: number;
    utenUnderkjenning: number;
    medEnUnderkjenning: number;
    medFlereUnderkjenninger: number;
    medianTidEtterUnderkjenningMillis: number | null;
}

export interface SakStatistikkKohortfrist {
    grunnlag: number;
    ferdige: number;
}

export interface SakStatistikkKohort {
    fraOgMed: string;
    tilOgMed: string;
    kategori: SakStatistikkKategori;
    sakYtelse: string;
    antallStartet: number;
    ferdigInnen30Dager: SakStatistikkKohortfrist;
    ferdigInnen60Dager: SakStatistikkKohortfrist;
    ferdigInnen90Dager: SakStatistikkKohortfrist;
    åpneVedTilOgMed: number;
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
    datagrunnlag: StønadStatistikkDatagrunnlag;
    rader: StønadStatistikkAntall[];
    bestandsendringerTilgjengelig: boolean;
    bestandsendringer: StønadStatistikkBestandsendring[];
}

export type StønadStatistikkDatagrunnlag = 'TILGJENGELIG' | 'MANGLER';

export interface StønadStatistikkAntall {
    stønadstype: string;
    vedtakstype: string;
    vedtaksresultat: string;
    stønadsklassifisering: string | null;
    antall: number;
}

export interface StønadStatistikkBestandsendring {
    stønadstype: string;
    nye: number;
    videreført: number;
    utgått: number;
    endretStønadsklassifisering: number;
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
