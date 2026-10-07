export type Statistikkoppløsning = 'UKE' | 'MÅNED' | 'ÅR';

export type SakStatistikkKategori = 'SØKNAD' | 'REVURDERING' | 'KLAGE' | 'STANS' | 'GJENOPPTAK' | 'TILBAKEKREVING';

export type Behandlingstidsmåling =
    | 'TOTAL_BEHANDLINGSTID'
    | 'SAKSBEHANDLING_FØR_ATTESTERING'
    | 'TID_HOS_ATTESTANT'
    | 'TID_ETTER_UNDERKJENNING';

export interface SakStatistikkMetadata {
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
    avslagsgrunner: SakStatistikkAvslagsfordeling[];
    opphørsgrunner: SakStatistikkOpphørsfordeling[];
    klageavvisningsgrunner: SakStatistikkKlageavvisningsfordeling[];
    klagehjemler: SakStatistikkKlagehjemmelfordeling[];
    klageomgjøringsgrunner: SakStatistikkKlageomgjøringsfordeling[];
}

export type SakStatistikkLov = 'SU' | 'FVL';

export interface SakStatistikkParagraf {
    lov: SakStatistikkLov;
    paragraf: number;
}

export interface SakStatistikkAvslagsgrunn {
    kode: string;
    paragrafer: SakStatistikkParagraf[];
    antallBehandlinger: number;
}

export interface SakStatistikkAvslagsfordeling {
    sakYtelse: string;
    antallAvslag: number;
    antallUtenBegrunnelse: number;
    antallMedUkjentBegrunnelse: number;
    grunner: SakStatistikkAvslagsgrunn[];
}

export interface SakStatistikkOpphørsgrunn {
    kode: string;
    paragrafer: SakStatistikkParagraf[];
    antallBehandlinger: number;
}

export interface SakStatistikkOpphørsfordeling {
    sakYtelse: string;
    antallOpphør: number;
    antallUtenBegrunnelse: number;
    antallMedUkjentBegrunnelse: number;
    grunner: SakStatistikkOpphørsgrunn[];
}

export interface SakStatistikkKlageavvisningsgrunn {
    kode: string;
    antallBehandlinger: number;
}

export interface SakStatistikkKlageavvisningsfordeling {
    sakYtelse: string;
    antallAvvisteKlager: number;
    antallUtenBegrunnelse: number;
    antallMedUkjentBegrunnelse: number;
    grunner: SakStatistikkKlageavvisningsgrunn[];
}

export interface SakStatistikkKlagehjemmel {
    kode: string;
    lov: SakStatistikkLov;
    paragraf: number;
    antallBehandlinger: number;
}

export interface SakStatistikkKlagehjemmelfordeling {
    sakYtelse: string;
    resultat: 'OPPRETTHOLDT' | 'DELVIS_OMGJØRING';
    antallKlager: number;
    antallUtenHjemmel: number;
    antallMedUkjentHjemmel: number;
    hjemler: SakStatistikkKlagehjemmel[];
}

export interface SakStatistikkKlageomgjøringsgrunn {
    kode: string;
    antallBehandlinger: number;
}

export interface SakStatistikkKlageomgjøringsfordeling {
    sakYtelse: string;
    resultat: 'OMGJORT' | 'DELVIS_OMGJØRING';
    antallKlager: number;
    antallUtenBegrunnelse: number;
    antallMedUkjentBegrunnelse: number;
    grunner: SakStatistikkKlageomgjøringsgrunn[];
}

export interface SakStatistikkAntall {
    behandlingskategori: SakStatistikkKategori;
    sakYtelse: string;
    behandlingAarsak: string | null;
    antall: number;
}

export interface SakStatistikkUtfall {
    behandlingskategori: SakStatistikkKategori;
    sakYtelse: string;
    status: string;
    resultat: string | null;
    antall: number;
}

export interface SakStatistikkStatus {
    behandlingskategori: SakStatistikkKategori;
    sakYtelse: string;
    status: string;
    antall: number;
}

export interface SakStatistikkBehandlingstid {
    behandlingskategori: SakStatistikkKategori;
    sakYtelse: string;
    måling: Behandlingstidsmåling;
    antall: number;
    gjennomsnittMillis: number;
    medianMillis: number;
    nittiendePersentilMillis: number;
}

export interface SakStatistikkBeholdningsalder {
    behandlingskategori: SakStatistikkKategori;
    sakYtelse: string;
    status: string;
    måling: Beholdningsaldersmåling;
    intervall: Beholdningsaldersintervall;
    antall: number;
}

export interface SakStatistikkOmarbeid {
    behandlingskategori: SakStatistikkKategori;
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
    behandlingskategori: SakStatistikkKategori;
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

export interface GenerererStønadstatistikkResponse {
    aggregatIder: string[];
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
    stønadstype: Stønadstype;
    vedtakstype: StønadVedtakstype;
    vedtaksresultat: StønadVedtaksresultat;
    stønadsklassifisering: string | null;
    antall: number;
}

export interface StønadStatistikkBestandsendring {
    stønadstype: Stønadstype;
    nye: number;
    videreført: number;
    utgått: number;
    endretStønadsklassifisering: number;
}

export type Stønadstype = 'SU_UFØR' | 'SU_ALDER';

export type StønadVedtakstype = 'SØKNAD' | 'REVURDERING' | 'STANS' | 'GJENOPPTAK' | 'REGULERING';

export type StønadVedtaksresultat = 'INNVILGET' | 'OPPHØRT' | 'STANSET' | 'GJENOPPTATT' | 'REGULERT';

export interface SakStatistikkParams {
    fraOgMed: string;
    tilOgMed: string;
    oppløsning: Statistikkoppløsning;
}

export interface StønadStatistikkParams {
    fraOgMed: string;
    tilOgMed: string;
}
