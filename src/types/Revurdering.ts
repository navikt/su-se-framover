import { Nullable } from '~lib/types';

import { Attestering } from './Behandling';
import { Beregning } from './Beregning';
import { GrunnlagsdataOgVilkårsvurderinger } from './grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { Periode } from './Periode';
import { Simulering } from './Simulering';
import { Vedtak } from './Vedtak';

export interface Revurdering<T extends RevurderingsStatus = RevurderingsStatus> {
    id: string;
    status: T;
    opprettet: string;
    periode: Periode<string>;
    tilRevurdering: Vedtak;
    saksbehandler: string;
    attesteringer: Attestering[];
    fritekstTilBrev: string;
    årsak: OpprettetRevurderingGrunn;
    begrunnelse: Nullable<string>;
    forhåndsvarsel: Nullable<Forhåndsvarsel>;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
    informasjonSomRevurderes: Record<InformasjonSomRevurderes, Vurderingstatus>;
}

interface Beregninger {
    beregning: Beregning;
    revurdert: Beregning;
}

export type OpprettetRevurdering = Revurdering<RevurderingsStatus.OPPRETTET>;

export interface BeregnetInnvilget extends Revurdering<RevurderingsStatus.BEREGNET_INNVILGET> {
    beregninger: Beregninger;
}

export interface BeregnetIngenEndring extends Revurdering<RevurderingsStatus.BEREGNET_INGEN_ENDRING> {
    beregninger: Beregninger;
}

export interface SimulertRevurdering
    extends Revurdering<RevurderingsStatus.SIMULERT_INNVILGET | RevurderingsStatus.SIMULERT_OPPHØRT> {
    beregninger: Beregninger;
    simulering: Simulering;
}

export interface RevurderingTilAttestering
    extends Revurdering<RevurderingsStatus.TIL_ATTESTERING_INNVILGET | RevurderingsStatus.TIL_ATTESTERING_OPPHØRT> {
    beregninger: Beregninger;
    skalFøreTilBrevutsending: boolean;
    simulering: Nullable<Simulering>;
}

export interface IverksattRevurdering
    extends Revurdering<RevurderingsStatus.IVERKSATT_INNVILGET | RevurderingsStatus.IVERKSATT_OPPHØRT> {
    beregninger: Beregninger;
    skalFøreTilBrevutsending: boolean;
    simulering: Nullable<Simulering>;
}

export interface UnderkjentRevurdering
    extends Revurdering<RevurderingsStatus.UNDERKJENT_INNVILGET | RevurderingsStatus.UNDERKJENT_OPPHØRT> {
    beregninger: Beregninger;
    skalFøreTilBrevutsending: boolean;
    simulering: Nullable<Simulering>;
}

export function harBeregninger(r: Revurdering): r is Revurdering & { beregninger: Beregninger } {
    return 'beregninger' in r;
}
export function harSimulering(r: Revurdering): r is Revurdering & { simulering: Simulering } {
    return 'simulering' in r && (r as SimulertRevurdering).simulering !== null;
}

export enum Forhåndsvarseltype {
    IngenForhåndsvarsel = 'INGEN_FORHÅNDSVARSEL',
    SkalVarslesSendt = 'SKAL_FORHÅNDSVARSLES_SENDT',
    SkalVarslesBesluttet = 'SKAL_FORHÅNDSVARSLES_BESLUTTET',
}

export enum BeslutningEtterForhåndsvarsling {
    FortsettSammeOpplysninger = 'FORTSETT_MED_SAMME_OPPLYSNINGER',
    FortsettMedAndreOpplysninger = 'FORTSETT_MED_ANDRE_OPPLYSNINGER',
    AvsluttUtenEndringer = 'AVSLUTT_UTEN_ENDRINGER',
}

interface ForhåndsvarselBase<T extends Forhåndsvarseltype = Forhåndsvarseltype> {
    type: T;
}
export type Ingen = ForhåndsvarselBase<Forhåndsvarseltype.IngenForhåndsvarsel>;
export type Sendt = ForhåndsvarselBase<Forhåndsvarseltype.SkalVarslesSendt>;
export interface Besluttet extends ForhåndsvarselBase<Forhåndsvarseltype.SkalVarslesBesluttet> {
    begrunnelse: string;
    beslutningEtterForhåndsvarsling: BeslutningEtterForhåndsvarsling;
}

export type Forhåndsvarsel = Ingen | Sendt | Besluttet;

export enum RevurderingsStatus {
    OPPRETTET = 'OPPRETTET',
    BEREGNET_INNVILGET = 'BEREGNET_INNVILGET',
    BEREGNET_INGEN_ENDRING = 'BEREGNET_INGEN_ENDRING',
    SIMULERT_OPPHØRT = 'SIMULERT_OPPHØRT',
    SIMULERT_INNVILGET = 'SIMULERT_INNVILGET',
    TIL_ATTESTERING_INNVILGET = 'TIL_ATTESTERING_INNVILGET',
    TIL_ATTESTERING_OPPHØRT = 'TIL_ATTESTERING_OPPHØRT',
    TIL_ATTESTERING_INGEN_ENDRING = 'TIL_ATTESTERING_INGEN_ENDRING',
    IVERKSATT_INNVILGET = 'IVERKSATT_INNVILGET',
    IVERKSATT_OPPHØRT = 'IVERKSATT_OPPHØRT',
    IVERKSATT_INGEN_ENDRING = 'IVERKSATT_INGEN_ENDRING',
    UNDERKJENT_INNVILGET = 'UNDERKJENT_INNVILGET',
    UNDERKJENT_OPPHØRT = 'UNDERKJENT_OPPHØRT',
    UNDERKJENT_INGEN_ENDRING = 'UNDERKJENT_INGEN_ENDRING',
}

export enum OpprettetRevurderingGrunn {
    MELDING_FRA_BRUKER = 'MELDING_FRA_BRUKER',
    INFORMASJON_FRA_KONTROLLSAMTALE = 'INFORMASJON_FRA_KONTROLLSAMTALE',
    DØDSFALL = 'DØDSFALL',
    ANDRE_KILDER = 'ANDRE_KILDER',
    MIGRERT = 'MIGRERT',
    REGULER_GRUNNBELØP = 'REGULER_GRUNNBELØP',
}

export type RevurderingErrorCodes =
    | GenerellErrors
    | PeriodeErrors
    | VilkårErrorCodes
    | BeregningOgSimuleringErrors
    | ForhåndsvarslingErrors
    | UtfallSomIkkeStøttesErrors
    | BrevErrors;

type VilkårErrorCodes = OpprettelseOgOppdateringErrors | UføreErrors | BostiuasjonErrors | FormueErrors | FradragErrors;

export enum GenerellErrors {
    G_REGULERING_KAN_IKKE_FØRE_TIL_OPPHØR = 'g_regulering_kan_ikke_føre_til_opphør',
    ATTESTANT_OG_SAKSBEHANDLER_KAN_IKKE_VÆRE_SAMME_PERSON = 'attestant_og_saksbehandler_kan_ikke_være_samme_person',
    FEILUTBETALING_STØTTES_IKKE = 'feilutbetalinger_støttes_ikke',

    FANT_IKKE_SAK = 'fant_ikke_sak',
    FANT_IKKE_PERSON = 'fant_ikke_person',
    FANT_IKKE_AKTØR_ID = 'fant_ikke_aktør_id',
    FANT_IKKE_REVURDERING = 'fant_ikke_revurdering',

    UGYLDIG_PERIODE = 'ugyldig_periode',
    UGYLDIG_TILSTAND = 'ugyldig_tilstand',
    UGYLDIG_ÅRSAK = 'ugyldig_årsak',
    UGYLDIG_BODY = 'ugyldig_body',

    KUNNE_IKKE_OPPRETTE_OPPGAVE = 'kunne_ikke_opprette_oppgave',
    KUNNE_IKKE_UTBETALE = 'kunne_ikke_utbetale',
    KUNNE_IKKE_SLÅ_OPP_EPS = 'kunne_ikke_slå_opp_eps',
}

export enum PeriodeErrors {
    INGENTING_Å_REVURDERE_I_PERIODEN = 'ingenting_å_revurdere_i_perioden',
    OVERLAPPENDE_VURDERINGSPERIODER = 'overlappende_vurderingsperioder',
    VURDERINGSPERIODE_UTENFOR_REVURDERINGSPERIODE = 'vurderingsperiode_utenfor_behandlingsperiode',
}

export enum ForhåndsvarslingErrors {
    ALLEREDE_FORHÅNDSVARSLET = 'allerede_forhåndsvarslet',
    KAN_IKKE_OPPDATERE_REVURDERING_SOM_ER_FORHÅNDSVARSLET = 'kan_ikke_oppdatere_revurdering_som_er_forhåndsvarslet',
    MANGLER_BESLUTNING_PÅ_FORHÅNDSVARSEL = 'mangler_beslutning_på_forhåndsvarsel',
    UGYLDIG_VALG = 'ugyldig_valg',
    ER_BESLUTTET = 'forhåndsvarslingen_er_allerede_besluttet',
    IKKE_FORHÅNDSVARSLET_FOR_Å_KUNNE_BESLUTTE = 'ikke_forhåndsvarslet_for_å_kunne_beslutte',
    IKKE_RIKTIG_TILSTAND_FOR_BESLUTTNING = 'ikke_riktig_tilstand_for_å_beslutte_forhåndsvarslingen',
}

export enum UtfallSomIkkeStøttesErrors {
    DELVIS_OPPHØR = 'delvis_opphør',
    OPPHØR_AV_FLERE_VILKÅR = 'opphør_av_flere_vilkår',
    OPPHØR_IKKE_FRA_FØRSTE_DATO_I_REVURDERINGSPERIODE = 'opphør_ikke_tidligste_dato',
    OPPHØR_OG_ANDRE_ENDRINGER_I_KOMBINASJON = 'opphør_og_andre_endringer_i_kombinasjon',
}

export enum OpprettelseOgOppdateringErrors {
    MÅ_VELGE_INFORMASJON_SOM_REVURDERES = 'må_velge_informasjon_som_revurderes',
    HULL_I_TIDSLINJE = 'tidslinje_for_vedtak_ikke_kontinuerlig',
    BEGRUNNELSE_KAN_IKKE_VÆRE_TOM = 'begrunnelse_kan_ikke_være_tom',
    UGYLDIG_ÅRSAK = 'ugyldig_årsak',
    BOSITUASJON_MED_FLERE_PERIODER_MÅ_VURDERES = 'bosituasjon_med_flere_perioder_må_revurderes',
    BOSITUASJON_FLERE_PERIODER_OG_EPS_INNTEKT = 'eps_inntekt_med_flere_perioder_må_revurderes',
    FORMUE_SOM_FØRER_TIL_OPPHØR_MÅ_REVURDERES = 'formue_som_fører_til_opphør_må_revurderes',
    EPS_FORMUE_MED_FLERE_PERIODER_MÅ_REVURDERES = 'eps_formue_med_flere_perioder_må_revurderes',
    KAN_IKKE_OPPDATERE_REVURDERING_SOM_ER_FORHÅNDSVARSLET = 'kan_ikke_oppdatere_revurdering_som_er_forhåndsvarslet',
}

export enum UføreErrors {
    UFØREGRAD_MÅ_VÆRE_MELLOM_EN_OG_HUNDRE = 'uføregrad_må_være_mellom_en_og_hundre',
    UFØREGRAD_OG_FORVENTET_INNTEKT_MANGLER = 'uføregrad_og_forventet_inntekt_mangler',
    PERIODE_FOR_GRUNNLAG_OG_VURDERING_ER_FORSKJELLIG = 'periode_for_grunnlag_og_vurdering_er_forskjellig',
    VURDERINGENE_MÅ_HA_SAMME_RESULTAT = 'vurderingene_må_ha_samme_resultat',
    HELE_BEHANDLINGSPERIODEN_MÅ_HA_VURDERING = 'hele_behandlingsperioden_må_ha_vurderinger',
    VURDERINGSPERIODER_MANGLER = 'vurderingsperioder_mangler',
}

export enum BostiuasjonErrors {
    KUNNE_IKKE_LEGGE_TIL_BOSITUASJONSGRUNNLAG = 'kunne_ikke_legge_til_bosituasjonsgrunnlag',
    EPS_ALDER_ER_NULL = 'eps_alder_er_null',
    KUNNE_IKKE_SLÅ_OPP_EPS = 'kunne_ikke_slå_opp_eps',
}

export enum FormueErrors {
    DEPOSITUM_MINDRE_ENN_INNSKUDD = 'depositum_mindre_enn_innskudd',
    VERDIER_KAN_IKKE_VÆRE_NEGATIV = 'verdier_kan_ikke_være_negativ',
    IKKE_LOV_MED_FORMUEPERIODE_UTENFOR_BOSITUASJONPERIODE = 'ikke_lov_med_formueperiode_utenfor_bosituasjonperiode',
    IKKE_LOV_MED_FORMUEPERIODE_UTENFOR_BEHANDLINGSPERIODEN = 'ikke_lov_med_formueperiode_utenfor_behandlingsperioden',
    IKKE_LOV_MED_FORMUE_FOR_EPS_HVIS_MAN_IKKE_HAR_EPS = 'ikke_lov_med_formue_for_eps_hvis_man_ikke_har_eps',
}

export enum FradragErrors {
    KUNNE_IKKE_LEGGE_TIL_FRADRAGSGRUNNLAG = 'kunne_ikke_legge_til_fradragsgrunnlag',
    FRADRAG_UGYLDIG_FRADRAGSTYPE = 'fradrag_ugyldig_fradragstype',
    KUNNE_IKKE_LAGE_FRADRAG = 'kunne_ikke_lage_fradrag',
    KAN_IKKE_HA_EPS_FRADRAG_UTEN_EPS = 'kan_ikke_ha_eps_fradrag_uten_eps',
    PERIODE_MANGLER = 'periode_mangler',
}

export enum BeregningOgSimuleringErrors {
    SISTE_MÅNED_VED_NEDGANG_I_STØNADEN = 'siste_måned_ved_nedgang_i_stønaden',
    UGYLDIG_BEREGNINGSGRUNNLAG = 'ugyldig_beregningsgrunnlag',
    KAN_IKKE_HA_EPS_FRADRAG_UTEN_EPS = 'kan_ikke_ha_eps_fradrag_uten_eps',

    FEILET = 'simulering_feilet',
    OPPDRAG_STENGT_ELLER_NEDE = 'simulering_feilet_oppdrag_stengt_eller_nede',
    FINNER_IKKE_PERSON = 'simulering_feilet_finner_ikke_person_i_tps',
    FINNER_IKKE_KJØRETIDSPLAN_FOR_FOM = 'simulering_feilet_finner_ikke_kjøreplansperiode_for_fom',
    OPPDRAGET_FINNES_IKKE = 'simulering_feilet_oppdraget_finnes_ikke',
}

export enum BrevErrors {
    NAVNEOPPSLAG_SAKSBEHANDLER_ATTESTTANT_FEILET = 'navneoppslag_feilet',
    FANT_IKKE_GJELDENDEUTBETALING = 'kunne_ikke_hente_gjeldende_utbetaling',
    KUNNE_IKKE_DISTRIBUERE = 'kunne_ikke_distribuere_brev',
    KUNNE_IKKE_JOURNALFØRE = 'kunne_ikke_journalføre_brev',
    KUNNE_IKKE_GENERERE_BREV = 'kunne_ikke_generere_brev',
    KUNNE_IKKE_LAGE_BREV = 'kunne_ikke_lage_brevutkast',
    FEIL_VED_GENERERING_AV_DOKUMENT = 'feil_ved_generering_av_dokument',
}

export enum InformasjonSomRevurderes {
    Uførhet = 'Uførhet',
    Inntekt = 'Inntekt',
    Bosituasjon = 'Bosituasjon',
    Formue = 'Formue',
}

export enum Vurderingstatus {
    IkkeVurdert = 'IkkeVurdert',
    Vurdert = 'Vurdert',
}

export interface BosituasjonRequest {
    sakId: string;
    revurderingId: string;
    epsFnr: Nullable<string>;
    erEPSUførFlyktning: Nullable<boolean>;
    delerBolig: Nullable<boolean>;
    begrunnelse: Nullable<string>;
}

export interface FormuegrunnlagVerdier {
    verdiIkkePrimærbolig: number;
    verdiEiendommer: number;
    verdiKjøretøy: number;
    innskudd: number;
    verdipapir: number;
    kontanter: number;
    pengerSkyldt: number;
    depositumskonto: number;
}

export type FormuegrunnlagFormue = Array<{
    periode: Periode<string>;
    søkersFormue: FormuegrunnlagVerdier;
    epsFormue: Nullable<FormuegrunnlagVerdier>;
    begrunnelse: Nullable<string>;
}>;

export interface FormuegrunnlagRequest {
    sakId: string;
    revurderingId: string;
    formue: FormuegrunnlagFormue;
}

export interface RevurderingProps {
    sakId: string;
    revurdering: Revurdering;
    gjeldendeGrunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
    forrigeUrl: string;
    nesteUrl: (revurdering: Revurdering) => string;
}
