import { Periode } from '~src/types/Periode';

export type HistoriskInfotrygdRevurderingStatus =
    | 'OPPRETTET'
    | 'BEREGNET'
    | 'TIL_ATTESTERING'
    | 'ATTESTERT'
    | 'UNDERKJENT'
    | 'AVSLUTTET';

export type HistoriskInfotrygdSatskategori = 'EN' | 'EU' | 'EO' | 'EV';
export type HistoriskInfotrygdØkonomiskRetning = 'INGEN_ENDRING' | 'ETTERBETALING' | 'FEILUTBETALING';
export type HistoriskInfotrygdMånedsresultat = 'YTELSE' | 'OPPHØR';
export type HistoriskInfotrygdOpprinneligResultat = 'YTELSE' | 'INGEN_YTELSE';
export type HistoriskInfotrygdMånedskilde = 'ORIGINAL_PROJEKSJON' | 'HISTORISK_REVURDERINGSVEDTAK';
export type HistoriskInfotrygdVedtaksbrevvalg = 'IKKE_VALGT' | 'SEND' | 'IKKE_SEND';
export type HistoriskInfotrygdForhåndsvarselstatus = 'IKKE_VALGT' | 'IKKE_SENDT' | 'SENDT';
export type HistoriskInfotrygdFradragTilhører = 'BRUKER' | 'EPS';

export type HistoriskInfotrygdManuellOpphørsgrunn =
    | 'FORMUE'
    | 'UTENLANDSOPPHOLD'
    | 'MANGLENDE_DOKUMENTASJON'
    | 'OPPHOLDSTILLATELSE'
    | 'FLYKTNING'
    | 'BOR_OG_OPPHOLDER_SEG_I_NORGE'
    | 'PERSONLIG_OPPMØTE'
    | 'INNLAGT_PÅ_INSTITUSJON'
    | 'ALDERSPENSJON'
    | 'FAMILIEGJENFORENING';

export type HistoriskInfotrygdOpphørsgrunn =
    | HistoriskInfotrygdManuellOpphørsgrunn
    | 'UFØRHET'
    | 'FOR_HØY_INNTEKT'
    | 'SU_UNDER_MINSTEGRENSE';

export type HistoriskInfotrygdSperregrunnForAttestering =
    | 'MANGLER_BEREGNING'
    | 'BEREGNING_DEKKER_IKKE_HELE_PERIODEN'
    | 'MANGLER_BEGRUNNELSE'
    | 'MANGLER_BEKREFTELSE_AV_HISTORISK_FORSORGINGSTILLEGG'
    | 'MANGLER_GYLDIG_FORHANDSVARSEL'
    | 'MANGLER_VEDTAKSBREVVALG'
    | 'MANGLER_FRITEKST_TIL_VEDTAKSBREV'
    | 'BLANDET_RESULTAT_MAA_BEHANDLES_SEPARAT';

export interface HistoriskInfotrygdForhåndsvarsel {
    status: HistoriskInfotrygdForhåndsvarselstatus;
    fritekst: string | null;
    begrunnelse: string | null;
    tidspunkt: string | null;
    erUtdatert: boolean;
}

export interface HistoriskInfotrygdRevurderingRequest {
    fnr: string;
    periode: Periode<string>;
}

export interface HistoriskInfotrygdRevurdering {
    id: string;
    sakId: string;
    periode: Periode<string>;
    status: HistoriskInfotrygdRevurderingStatus;
    begrunnelse: string | null;
    vedtaksbrevvalg: HistoriskInfotrygdVedtaksbrevvalg;
    vedtaksbrevFritekst: string | null;
    kreverKontrollAvHistoriskForsørgingstillegg: boolean;
    harBekreftetKontrollAvHistoriskForsørgingstillegg: boolean;
    forhåndsvarsel: HistoriskInfotrygdForhåndsvarsel;
    sperregrunnerForAttestering: HistoriskInfotrygdSperregrunnForAttestering[];
    opprettet: string;
    oppdatert: string;
}

export interface HistoriskInfotrygdUtenlandskInntekt {
    beløpIUtenlandskValuta: number;
    valuta: string;
    kurs: number;
}

export interface HistoriskInfotrygdFradragForMåned {
    type: string;
    beskrivelse: string | null;
    månedsbeløp: number;
    utenlandskInntekt: HistoriskInfotrygdUtenlandskInntekt | null;
    tilhører: HistoriskInfotrygdFradragTilhører;
}

export interface HistoriskInfotrygdManueltOpphør {
    opphørsgrunn: HistoriskInfotrygdManuellOpphørsgrunn;
    begrunnelse: string;
}

export interface HistoriskInfotrygdBeregningsgrunnlagForMåned {
    måned: string;
    satskategori: HistoriskInfotrygdSatskategori;
    fradrag: HistoriskInfotrygdFradragForMåned[];
    manueltOpphør: HistoriskInfotrygdManueltOpphør | null;
    gjeninnvilgelsesbegrunnelse: string | null;
}

export interface HistoriskInfotrygdBeregningForMåned extends HistoriskInfotrygdBeregningsgrunnlagForMåned {
    gammeltBeløp: number;
    nyttBeløp: number;
    differanse: number;
    nyttResultat: HistoriskInfotrygdMånedsresultat;
    opphørsgrunn: HistoriskInfotrygdOpphørsgrunn | null;
    begrunnelse: string | null;
}

export interface HistoriskInfotrygdLagretBeregning {
    økonomiskRetning: HistoriskInfotrygdØkonomiskRetning;
    måneder: HistoriskInfotrygdBeregningForMåned[];
}

export interface HistoriskInfotrygdMånedsgrunnlagForMåned {
    måned: string;
    resultat: HistoriskInfotrygdOpprinneligResultat;
    stønadsstart: string | null;
    opprinneligStønadId: number | null;
    opprinneligVedtakId: number | null;
    oppdragId: string | null;
    kilde: HistoriskInfotrygdMånedskilde;
    historiskSats: number | null;
    historiskFradrag: number | null;
    historiskFradragskoder: string[];
    historiskBeløp: number | null;
    foreslåttSatskategori: HistoriskInfotrygdSatskategori | null;
    kreverKontrollAvHistoriskForsørgingstillegg: boolean;
}

export interface HistoriskInfotrygdMånedsgrunnlag {
    revurderingId: string;
    kreverKontrollAvHistoriskForsørgingstillegg: boolean;
    harBekreftetKontrollAvHistoriskForsørgingstillegg: boolean;
    måneder: HistoriskInfotrygdMånedsgrunnlagForMåned[];
    beregning: HistoriskInfotrygdLagretBeregning | null;
}

export interface BeregnHistoriskInfotrygdRevurderingRequest {
    revurderingId: string;
    begrunnelse: string;
    måneder: HistoriskInfotrygdBeregningsgrunnlagForMåned[];
}

export interface BeregnHistoriskInfotrygdRevurderingResponse extends HistoriskInfotrygdLagretBeregning {
    behandling: HistoriskInfotrygdRevurdering;
}

export interface HistoriskInfotrygdAvsluttRequest {
    begrunnelse: string;
}

export interface OppdaterHistoriskInfotrygdVedtaksbrevRequest {
    valg: Exclude<HistoriskInfotrygdVedtaksbrevvalg, 'IKKE_VALGT'>;
    fritekst: string | null;
}
