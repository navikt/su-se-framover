import { Nullable } from '~lib/types';

import { Attestering } from './Behandling';
import { Beregning } from './Beregning';
import { Periode } from './Periode';
import { Simulering } from './Simulering';
import { Vedtak } from './Vedtak';
import { GrunnlagsdataOgVilkårsvurderinger } from './Vilkår';

export interface Revurdering<T extends RevurderingsStatus = RevurderingsStatus> {
    id: string;
    status: T;
    opprettet: string;
    periode: Periode<string>;
    tilRevurdering: Vedtak;
    saksbehandler: string;
    attestering: Nullable<Attestering>;
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
    attestering: Attestering;
    skalFøreTilBrevutsending: boolean;
    simulering: Nullable<Simulering>;
}

export interface UnderkjentRevurdering
    extends Revurdering<RevurderingsStatus.UNDERKJENT_INNVILGET | RevurderingsStatus.UNDERKJENT_OPPHØRT> {
    beregninger: Beregninger;
    attestering: Attestering;
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

export enum RevurderingErrorCodes {
    //forhåndsvarsling
    ALLEREDE_FORHÅNDSVARSLET = 'allerede_forhåndsvarslet',
    KAN_IKKE_OPPDATERE_REVURDERING_SOM_ER_FORHÅNDSVARSLET = 'kan_ikke_oppdatere_revurdering_som_er_forhåndsvarslet',
    MANGLER_BESLUTNING_PÅ_FORHÅNDSVARSEL = 'mangler_beslutning_på_forhåndsvarsel',

    //perioder
    INGENTING_Å_REVURDERE_I_PERIODEN = 'ingenting_å_revurdere_i_perioden',
    OVERLAPPENDE_VURDERINGSPERIODER = 'overlappende_vurderingsperioder',
    HELE_REVURDERINGSPERIODEN_MÅ_HA_VURDERINGER = 'hele_behandlingsperioden_må_ha_vurderinger',
    VURDERINGSPERIODE_UTENFOR_REVURDERINGSPERIODE = 'vurderingsperiode_utenfor_behandlingsperiode',

    //Fant_ikke....
    FANT_IKKE_SAK = 'fant_ikke_sak',
    FANT_IKKE_PERSON = 'fant_ikke_person',
    FANT_IKKE_AKTØR_ID = 'fant_ikke_aktør_id',
    FANT_IKKE_REVURDERING = 'fant_ikke_revurdering',

    //ugyldig...
    UGYLDIG_PERIODE = 'ugyldig_periode',
    UGYLDIG_TILSTAND = 'ugyldig_tilstand',
    UGYLDIG_ÅRSAK = 'ugyldig_årsak',
    UGYLDIG_DATA = 'ugyldig_data',

    //kunne_ikke...
    KUNNE_IKKE_OPPRETTE_OPPGAVE = 'kunne_ikke_opprette_oppgave',
    KUNNE_IKKE_DISTRIBUERE_BREV = 'kunne_ikke_distribuere_brev',
    KUNNE_IKKE_JOURNALFØRE_BREV = 'kunne_ikke_journalføre_brev',
    KUNNE_IKKE_KONTROLL_SIMULERE = 'kunne_ikke_kontrollsimulere',
    KUNNE_IKKE_UTBETALE = 'kunne_ikke_utbetale',
    KUNNE_IKKE_SLÅ_OPP_EPS = 'kunne_ikke_slå_opp_eps',

    //EPS
    EPS_ALDER_ER_NULL = 'eps_alder_er_null',
    KAN_IKKE_HA_EPS_FRADRAG_UTEN_EPS = 'kan_ikke_ha_eps_fradrag_uten_eps',
    GJELDENDE_EPS_HAR_FORMUE = 'gjeldende_eps_har_formue',

    //generell
    BEGRUNNELSE_KAN_IKKE_VÆRE_TOM = 'begrunnelse_kan_ikke_være_tom',
    UFULLSTENDIG_BEHANDLINGSINFORMASJON = 'ufullstendig_behandlingsinformasjon',
    SIMULERING_FEILET = 'simulering_feilet',
    SISTE_MÅNED_VED_NEDGANG_I_STØNADEN = 'siste_måned_ved_nedgang_i_stønaden',
    G_REGULERING_KAN_IKKE_FØRE_TIL_OPPHØR = 'g_regulering_kan_ikke_føre_til_opphør',
    VURDERINGENE_MÅ_HA_SAMME_RESULTAT = 'vurderingene_må_ha_samme_resultat',
    ATTESTANT_OG_SAKSBEHANDLER_KAN_IKKE_VÆRE_SAMME_PERSON = 'attestant_og_saksbehandler_kan_ikke_være_samme_person',

    //revurderingsutfall som ikke støttes
    OPPHØR_OG_ANDRE_ENDRINGER_I_KOMBINASJON = 'opphør_og_andre_endringer_i_kombinasjon',
    OPPHØR_IKKE_FRA_FØRSTE_DATO_I_REVURDERINGSPERIODE = 'opphør_ikke_tidligste_dato',
    DELVIS_OPPHØR = 'delvis_opphør',
    OPPHØR_AV_FLERE_VILKÅR = 'opphør_av_flere_vilkår',
}
export interface LeggTilUføreResponse {
    revurdering: Revurdering;
    gjeldendeVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
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
