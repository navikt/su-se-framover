import { Periode } from '~src/types/Periode';

export type HistoriskInfotrygdRevurderingStatus =
    | 'OPPRETTET'
    | 'BEREGNET'
    | 'TIL_ATTESTERING'
    | 'ATTESTERT'
    | 'UNDERKJENT'
    | 'AVSLUTTET';

export type HistoriskInfotrygdSatskategori = 'EN' | 'EU' | 'EO' | 'EV';
export type HistoriskInfotrygdRevurderingsbosituasjon =
    | 'ENSLIG'
    | 'EPS_UNDER_67'
    | 'EPS_OVER_67'
    | 'ENSLIG_MED_BOFELLESSKAP'
    | 'EPS_UNDER_67_UFØR_FLYKTNING';
export type HistoriskInfotrygdØkonomiskRetning = 'INGEN_ENDRING' | 'ETTERBETALING' | 'FEILUTBETALING';
export type HistoriskInfotrygdMånedsresultat = 'YTELSE' | 'OPPHØR';
export type HistoriskInfotrygdOpprinneligResultat = 'YTELSE' | 'INGEN_YTELSE';
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
    | 'MANGLER_GYLDIG_FORHANDSVARSEL'
    | 'MANGLER_VEDTAKSBREVVALG'
    | 'MANGLER_FRITEKST_TIL_VEDTAKSBREV';

export interface HistoriskInfotrygdForhåndsvarsel {
    status: HistoriskInfotrygdForhåndsvarselstatus;
    fritekst: string | null;
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
    avslutningsbegrunnelse: string | null;
    vedtaksbrevvalg: HistoriskInfotrygdVedtaksbrevvalg;
    vedtaksbrevFritekst: string | null;
    kreverKontrollAvHistoriskForsørgingstillegg: boolean;
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
}

export interface HistoriskInfotrygdBeregningsgrunnlagForMåned {
    måned: string;
    bosituasjon: HistoriskInfotrygdRevurderingsbosituasjon;
    fradrag: HistoriskInfotrygdFradragForMåned[];
    manueltOpphør: HistoriskInfotrygdManueltOpphør | null;
}

export type HistoriskInfotrygdMånedsutkast = Omit<HistoriskInfotrygdBeregningsgrunnlagForMåned, 'bosituasjon'> & {
    bosituasjon: HistoriskInfotrygdRevurderingsbosituasjon | null;
};

export interface HistoriskInfotrygdBeregningForMåned extends HistoriskInfotrygdBeregningsgrunnlagForMåned {
    satskategori: HistoriskInfotrygdSatskategori | null;
    sats: number;
    epsFribeløp: number;
    epsFradrag: number;
    sumFradrag: number;
    gammeltBeløp: number;
    nyttBeløp: number;
    differanse: number;
    nyttResultat: HistoriskInfotrygdMånedsresultat;
    opphørsgrunn: HistoriskInfotrygdOpphørsgrunn | null;
}

export interface HistoriskInfotrygdLagretBeregning {
    økonomiskRetning: HistoriskInfotrygdØkonomiskRetning;
    måneder: HistoriskInfotrygdBeregningForMåned[];
}

export type HistoriskInfotrygdYtelseskilde =
    | {
          type: 'INFOTRYGD';
          projeksjonId: string;
          fradragskoder: string[];
      }
    | {
          type: 'HISTORISK_REVURDERINGSVEDTAK_I_SUAPP';
          vedtakId: string;
          fradrag: HistoriskInfotrygdFradragForMåned[];
      };

type HistoriskInfotrygdKildeUtenYtelse =
    | { type: 'INFOTRYGD'; projeksjonId: string }
    | { type: 'HISTORISK_REVURDERINGSVEDTAK_I_SUAPP'; vedtakId: string };

export interface HistoriskInfotrygdVedtaksgrunnlagMedYtelse {
    måned: string;
    resultat: 'YTELSE';
    stønadsstart: string | null;
    kilde: HistoriskInfotrygdYtelseskilde;
    sats: number;
    samletFradrag: number;
    ytelsesbeløp: number;
    foreslåttBosituasjon: HistoriskInfotrygdRevurderingsbosituasjon | null;
    foreslåttSatskategori: HistoriskInfotrygdSatskategori | null;
    kreverKontrollAvHistoriskForsørgingstillegg: boolean;
}

export type HistoriskInfotrygdMånedsgrunnlagForMåned =
    | HistoriskInfotrygdVedtaksgrunnlagMedYtelse
    | {
          måned: string;
          resultat: 'INGEN_YTELSE';
          kilde: HistoriskInfotrygdKildeUtenYtelse;
      };

export interface HistoriskInfotrygdMånedsgrunnlag {
    revurderingId: string;
    // Grunnlag før denne revurderingen: fra Infotrygd eller et tidligere historisk revurderingsvedtak, angitt av kilde.
    vedtaksgrunnlagSomRevurderes: HistoriskInfotrygdMånedsgrunnlagForMåned[];
    // Lagret beregning på denne revurderingen, ikke de gamle vedtakene eller ulagrede skjemaendringer.
    lagretBeregningINåværendeRevurdering: HistoriskInfotrygdLagretBeregning | null;
}

export interface BeregnHistoriskInfotrygdRevurderingRequest {
    revurderingId: string;
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
