import { Nullable } from '~lib/types';

import { Behandling, Attestering } from './Behandling';
import { Behandlingsinformasjon } from './Behandlingsinformasjon';
import { Beregning } from './Beregning';
import { Periode } from './Periode';
import { Simulering } from './Simulering';
import { Vilkårsvurderinger } from './Vilkår';

export interface Revurdering<T extends RevurderingsStatus = RevurderingsStatus> {
    id: string;
    status: T;
    opprettet: string;
    periode: Periode<string>;
    tilRevurdering: Behandling;
    saksbehandler: string;
    attestering: Nullable<Attestering>;
    fritekstTilBrev: string;
    årsak: OpprettetRevurderingGrunn;
    begrunnelse: Nullable<string>;
    forhåndsvarsel: Nullable<Forhåndsvarsel>;
    behandlingsinformasjon: Behandlingsinformasjon;
    vilkårsvurderinger: Vilkårsvurderinger;
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

export function harSimulering(r: Revurdering): r is Revurdering & { simulering: Simulering } {
    return 'simulering' in r && r['simulering'] !== null;
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
    ALLEREDE_FORHÅNDSVARSLET = 'allerede_forhåndsvarslet',
    INGENTING_Å_REVURDERE_I_PERIODEN = 'ingenting_å_revurdere_i_perioden',
    BEGRUNNELSE_KAN_IKKE_VÆRE_TOM = 'begrunnelse_kan_ikke_være_tom',
    KAN_IKKE_OPPDATERE_REVURDERING_SOM_ER_FORHÅNDSVARSLET = 'kan_ikke_oppdatere_revurdering_som_er_forhåndsvarslet',
    PERIODE_OG_ÅRSAK_KOMBINASJON_ER_UGYLDIG = 'periode_og_årsak_kombinasjon_er_ugyldig',
    FANT_IKKE_SAK = 'fant_ikke_sak',
    FANT_IKKE_PERSON = 'fant_ikke_person',
    FANT_IKKE_AKTØR_ID = 'fant_ikke_aktør_id',
    FANT_IKKE_REVURDERING = 'fant_ikke_revurdering',
    UGYLDIG_PERIODE = 'ugyldig_periode',
    UGYLDIG_TILSTAND = 'ugyldig_tilstand',
    UGYLDIG_ÅRSAK = 'ugyldig_årsak',
    KUNNE_IKKE_OPPRETTE_OPPGAVE = 'kunne_ikke_opprette_oppgave',
    KUNNE_IKKE_DISTRIBUERE_BREV = 'kunne_ikke_distribuere_brev',
    KUNNE_IKKE_JOURNALFØRE_BREV = 'kunne_ikke_journalføre_brev',
    UFULLSTENDIG_BEHANDLINGSINFORMASJON = 'ufullstendig_behandlingsinformasjon',
    SIMULERING_FEILET = 'simulering_feilet',
    SISTE_MÅNED_VED_NEDGANG_I_STØNADEN = 'siste_måned_ved_nedgang_i_stønaden',
    G_REGULERING_KAN_IKKE_FØRE_TIL_OPPHØR = 'g_regulering_kan_ikke_føre_til_opphør',
    MANGLER_BESLUTNING_PÅ_FORHÅNDSVARSEL = 'mangler_beslutning_på_forhåndsvarsel',
    OVERLAPPENDE_VURDERINGSPERIODER = 'overlappende_vurderingsperioder',
    VURDERINGENE_MÅ_HA_SAMME_RESULTAT = 'vurderingene_må_ha_samme_resultat',
    VURDERINGSPERIODE_UTENFOR_REVURDERINGSPERIODE = 'vurderingsperiode_utenfor_behandlingsperiode',
}
export interface LeggTilUføreResponse {
    revurdering: Revurdering;
    gjeldendeVilkårsvurderinger: Vilkårsvurderinger;
}
