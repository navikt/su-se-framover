import { Nullable } from '~lib/types';

import { Attestering } from './Behandling';
import { Beregning } from './Beregning';
import { GrunnlagsdataOgVilkårsvurderinger } from './grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { Periode } from './Periode';
import { Simulering } from './Simulering';
import { Vedtak } from './Vedtak';

//Dette er feltene som deles av backends 'abstrakte' revurdering. Hadde vært fint å skille på dem litt mer, både bak og fram
export interface Revurdering<T extends RevurderingsStatus = RevurderingsStatus> {
    id: string;
    status: T;
    opprettet: string;
    periode: Periode<string>;
    tilRevurdering: Vedtak;
    saksbehandler: string;
    attesteringer: Attestering[];
    årsak: OpprettetRevurderingGrunn;
    begrunnelse: Nullable<string>;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
    forhåndsvarsel: Nullable<Forhåndsvarsel>;
}

/**
 * Dette gjelder revurdering av Grunnlagsdata, vilkårssett, og potensielt utbetaling (endring fører til utbetaling. ingen endring fører ikke til utbetaling)
 * eksempler som ikke inngår, stans og gjenoppta av utbetaling, siden dem kun endrer utbetaling
 */
export interface InformasjonsRevurdering<T extends RevurderingsStatus = RevurderingsStatus> extends Revurdering {
    status: T;
    fritekstTilBrev: string;
    informasjonSomRevurderes: Record<InformasjonSomRevurderes, Vurderingstatus>;
}

/**
 * Dette gjelder kun de revurderingene som kun endrer på utbetalingene
 * eksempler: stans og gjenoppta
 */
export interface UtbetalingsRevurdering<T extends RevurderingsStatus> extends Revurdering {
    status: T;
}

export type OpprettetRevurdering = InformasjonsRevurdering<RevurderingsStatus.OPPRETTET>;

export interface BeregnetInnvilget extends InformasjonsRevurdering<RevurderingsStatus.BEREGNET_INNVILGET> {
    beregning: Beregning;
}

export interface BeregnetIngenEndring extends InformasjonsRevurdering<RevurderingsStatus.BEREGNET_INGEN_ENDRING> {
    beregning: Beregning;
}

export interface SimulertRevurdering
    extends InformasjonsRevurdering<RevurderingsStatus.SIMULERT_INNVILGET | RevurderingsStatus.SIMULERT_OPPHØRT> {
    beregning: Beregning;
    simulering: Simulering;
}

export interface RevurderingTilAttestering
    extends InformasjonsRevurdering<
        RevurderingsStatus.TIL_ATTESTERING_INNVILGET | RevurderingsStatus.TIL_ATTESTERING_OPPHØRT
    > {
    beregning: Beregning;
    skalFøreTilBrevutsending: boolean;
    simulering: Nullable<Simulering>;
}

export interface IverksattRevurdering
    extends InformasjonsRevurdering<RevurderingsStatus.IVERKSATT_INNVILGET | RevurderingsStatus.IVERKSATT_OPPHØRT> {
    beregning: Beregning;
    skalFøreTilBrevutsending: boolean;
    simulering: Nullable<Simulering>;
}

export interface UnderkjentRevurdering
    extends InformasjonsRevurdering<RevurderingsStatus.UNDERKJENT_INNVILGET | RevurderingsStatus.UNDERKJENT_OPPHØRT> {
    beregning: Beregning;
    skalFøreTilBrevutsending: boolean;
    simulering: Nullable<Simulering>;
}

export interface AvsluttetRevurdering extends InformasjonsRevurdering<RevurderingsStatus.AVSLUTTET> {
    beregning: Nullable<Beregning>;
    simulering: Nullable<Simulering>;
}

export function harBeregninger(r: Revurdering): r is Revurdering & { beregning: Beregning } {
    return 'beregning' in r;
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
    SIMULERT_STANS = 'SIMULERT_STANS',
    AVSLUTTET_STANS = 'AVSLUTTET_STANS',
    SIMULERT_GJENOPPTAK = 'SIMULERT_GJENOPPTAK',
    TIL_ATTESTERING_INNVILGET = 'TIL_ATTESTERING_INNVILGET',
    TIL_ATTESTERING_OPPHØRT = 'TIL_ATTESTERING_OPPHØRT',
    TIL_ATTESTERING_INGEN_ENDRING = 'TIL_ATTESTERING_INGEN_ENDRING',
    IVERKSATT_INNVILGET = 'IVERKSATT_INNVILGET',
    IVERKSATT_OPPHØRT = 'IVERKSATT_OPPHØRT',
    IVERKSATT_INGEN_ENDRING = 'IVERKSATT_INGEN_ENDRING',
    IVERKSATT_STANS = 'IVERKSATT_STANS',
    AVSLUTTET_GJENOPPTAK = 'AVSLUTTET_GJENOPPTAK',
    IVERKSATT_GJENOPPTAK = 'IVERKSATT_GJENOPPTAK',
    UNDERKJENT_INNVILGET = 'UNDERKJENT_INNVILGET',
    UNDERKJENT_OPPHØRT = 'UNDERKJENT_OPPHØRT',
    UNDERKJENT_INGEN_ENDRING = 'UNDERKJENT_INGEN_ENDRING',
    AVSLUTTET = 'AVSLUTTET',
}

export enum OpprettetRevurderingGrunn {
    MELDING_FRA_BRUKER = 'MELDING_FRA_BRUKER',
    INFORMASJON_FRA_KONTROLLSAMTALE = 'INFORMASJON_FRA_KONTROLLSAMTALE',
    DØDSFALL = 'DØDSFALL',
    ANDRE_KILDER = 'ANDRE_KILDER',
    MIGRERT = 'MIGRERT',
    REGULER_GRUNNBELØP = 'REGULER_GRUNNBELØP',
    MANGLENDE_KONTROLLERKLÆRING = 'MANGLENDE_KONTROLLERKLÆRING',
    MOTTATT_KONTROLLERKLÆRING = 'MOTTATT_KONTROLLERKLÆRING',
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
    nesteUrl: (revurdering: InformasjonsRevurdering) => string;
}
