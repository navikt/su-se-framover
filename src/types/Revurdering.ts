import { Nullable } from '~src/lib/types';
import { FastOppholdVurderingRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/fastOpphold/FastOppholdVilkår';
import { FlyktningRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/flyktning/Flyktning';

import { Behandling } from './Behandling';
import { Beregning } from './Beregning';
import { GrunnlagsdataOgVilkårsvurderinger } from './grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { InstitusjonsoppholdVurderingRequest } from './grunnlagsdataOgVilkårsvurderinger/institusjonsopphold/Institusjonsopphold';
import { PersonligOppmøteVurderingRequest } from './grunnlagsdataOgVilkårsvurderinger/personligOppmøte/PersonligOppmøte';
import { Utenlandsperiode } from './grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { Periode } from './Periode';
import { Simulering, SimulertPeriode } from './Simulering';

//Dette er feltene som deles av backends 'abstrakte' revurdering. Hadde vært fint å skille på dem litt mer, både bak og fram
export interface Revurdering<T extends RevurderingsStatus = RevurderingsStatus> extends Behandling<RevurderingsStatus> {
    status: T;
    periode: Periode<string>;
    saksbehandler: string;
    årsak: OpprettetRevurderingGrunn;
    begrunnelse: Nullable<string>;
    forhåndsvarsel: Nullable<Forhåndsvarsel>;
}

export interface InformasjonsRevurdering2 extends Revurdering<InformasjonsRevurderingStatus> {
    fritekstTilBrev: string;
    informasjonSomRevurderes: Record<InformasjonSomRevurderes, Vurderingstatus>;
}

/**
 * Dette gjelder kun de revurderingene som kun endrer på utbetalingene
 * eksempler: stans og gjenoppta
 */
export interface UtbetalingsRevurdering<T extends UtbetalingsRevurderingStatus = UtbetalingsRevurderingStatus>
    extends Revurdering {
    status: T;
}

export interface StansAvYtelse
    extends UtbetalingsRevurdering<
        UtbetalingsRevurderingStatus.SIMULERT_STANS | UtbetalingsRevurderingStatus.IVERKSATT_STANS
    > {
    simulering: Simulering;
}

export interface Gjenopptak
    extends UtbetalingsRevurdering<
        UtbetalingsRevurderingStatus.SIMULERT_GJENOPPTAK | UtbetalingsRevurderingStatus.IVERKSATT_GJENOPPTAK
    > {
    simulering: Simulering;
}

/**
 * Dette gjelder revurdering av Grunnlagsdata, vilkårssett, og potensielt utbetaling (endring fører til utbetaling. ingen endring fører ikke til utbetaling)
 * eksempler som ikke inngår, stans og gjenoppta av utbetaling, siden dem kun endrer utbetaling
 */
export interface InformasjonsRevurdering<T extends InformasjonsRevurderingStatus = InformasjonsRevurderingStatus>
    extends Revurdering<InformasjonsRevurderingStatus> {
    status: T;
    fritekstTilBrev: string;
    informasjonSomRevurderes: Record<InformasjonSomRevurderes, Vurderingstatus>;
}

export type OpprettetRevurdering = InformasjonsRevurdering<InformasjonsRevurderingStatus.OPPRETTET>;

export type SimuleringForAvkortingsvarsel = {
    perioder: SimulertPeriode[];
    totalBruttoYtelse: number;
};

export interface BeregnetInnvilget extends InformasjonsRevurdering<InformasjonsRevurderingStatus.BEREGNET_INNVILGET> {
    beregning: Beregning;
}

export interface BeregnetIngenEndring
    extends InformasjonsRevurdering<InformasjonsRevurderingStatus.BEREGNET_INGEN_ENDRING> {
    beregning: Beregning;
}

export interface SimulertRevurdering
    extends InformasjonsRevurdering<
        InformasjonsRevurderingStatus.SIMULERT_INNVILGET | InformasjonsRevurderingStatus.SIMULERT_OPPHØRT
    > {
    beregning: Beregning;
    simulering: Simulering;
    simuleringForAvkortingsvarsel: Nullable<SimuleringForAvkortingsvarsel>;
    tilbakekrevingsbehandling: Nullable<Tilbakekrevingsbehandling>;
}

export interface RevurderingTilAttestering
    extends InformasjonsRevurdering<
        InformasjonsRevurderingStatus.TIL_ATTESTERING_INNVILGET | InformasjonsRevurderingStatus.TIL_ATTESTERING_OPPHØRT
    > {
    beregning: Beregning;
    skalFøreTilBrevutsending: boolean;
    simulering: Nullable<Simulering>;
    simuleringForAvkortingsvarsel: Nullable<SimuleringForAvkortingsvarsel>;
    tilbakekrevingsbehandling: Nullable<Tilbakekrevingsbehandling>;
}

export interface IverksattRevurdering
    extends InformasjonsRevurdering<
        InformasjonsRevurderingStatus.IVERKSATT_INNVILGET | InformasjonsRevurderingStatus.IVERKSATT_OPPHØRT
    > {
    beregning: Beregning;
    skalFøreTilBrevutsending: boolean;
    simulering: Nullable<Simulering>;
    simuleringForAvkortingsvarsel: Nullable<SimuleringForAvkortingsvarsel>;
    tilbakekrevingsbehandling: Nullable<Tilbakekrevingsbehandling>;
}

export interface UnderkjentRevurdering
    extends InformasjonsRevurdering<
        InformasjonsRevurderingStatus.UNDERKJENT_INNVILGET | InformasjonsRevurderingStatus.UNDERKJENT_OPPHØRT
    > {
    beregning: Beregning;
    skalFøreTilBrevutsending: boolean;
    simulering: Nullable<Simulering>;
    simuleringForAvkortingsvarsel: Nullable<SimuleringForAvkortingsvarsel>;
    tilbakekrevingsbehandling: Nullable<Tilbakekrevingsbehandling>;
}

export interface AvsluttetRevurdering extends InformasjonsRevurdering<InformasjonsRevurderingStatus.AVSLUTTET> {
    beregning: Nullable<Beregning>;
    simulering: Nullable<Simulering>;
}

export enum Forhåndsvarseltype {
    IngenForhåndsvarsel = 'INGEN_FORHÅNDSVARSEL',
    SkalVarslesSendt = 'SKAL_FORHÅNDSVARSLES_SENDT',
    SkalVarslesBesluttet = 'SKAL_FORHÅNDSVARSLES_BESLUTTET',
}

export enum BeslutningEtterForhåndsvarsling {
    FortsettSammeOpplysninger = 'FORTSETT_MED_SAMME_OPPLYSNINGER',
    FortsettMedAndreOpplysninger = 'FORTSETT_MED_ANDRE_OPPLYSNINGER',
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

export type RevurderingsStatus = InformasjonsRevurderingStatus | UtbetalingsRevurderingStatus;

export enum InformasjonsRevurderingStatus {
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
    AVSLUTTET = 'AVSLUTTET',
}

export enum UtbetalingsRevurderingStatus {
    SIMULERT_STANS = 'SIMULERT_STANS',
    SIMULERT_GJENOPPTAK = 'SIMULERT_GJENOPPTAK',

    AVSLUTTET_STANS = 'AVSLUTTET_STANS',
    AVSLUTTET_GJENOPPTAK = 'AVSLUTTET_GJENOPPTAK',

    IVERKSATT_STANS = 'IVERKSATT_STANS',
    IVERKSATT_GJENOPPTAK = 'IVERKSATT_GJENOPPTAK',
}

export enum OpprettetRevurderingGrunn {
    MELDING_FRA_BRUKER = 'MELDING_FRA_BRUKER',
    INFORMASJON_FRA_KONTROLLSAMTALE = 'INFORMASJON_FRA_KONTROLLSAMTALE',
    DØDSFALL = 'DØDSFALL',
    ANDRE_KILDER = 'ANDRE_KILDER',
    REGULER_GRUNNBELØP = 'REGULER_GRUNNBELØP',
    MIGRERT = 'MIGRERT',
    MANGLENDE_KONTROLLERKLÆRING = 'MANGLENDE_KONTROLLERKLÆRING',
    MOTTATT_KONTROLLERKLÆRING = 'MOTTATT_KONTROLLERKLÆRING',
    IKKE_MOTTATT_ETTERSPURT_DOKUMENTASJON = 'IKKE_MOTTATT_ETTERSPURT_DOKUMENTASJON',
}

export const gyldigeÅrsaker = Object.values(OpprettetRevurderingGrunn).filter(
    (x) =>
        ![
            OpprettetRevurderingGrunn.MIGRERT,
            OpprettetRevurderingGrunn.MANGLENDE_KONTROLLERKLÆRING,
            OpprettetRevurderingGrunn.MOTTATT_KONTROLLERKLÆRING,
        ].includes(x)
);

export enum InformasjonSomRevurderes {
    Uførhet = 'Uførhet',
    Inntekt = 'Inntekt',
    Bosituasjon = 'Bosituasjon',
    Formue = 'Formue',
    Utenlandsopphold = 'Utenlandsopphold',
    Flyktning = 'Flyktning',
    FastOpphold = 'FastOppholdINorge',
    Opplysningsplikt = 'Opplysningsplikt',
    Oppholdstillatelse = 'Oppholdstillatelse',
    PersonligOppmøte = 'PersonligOppmøte',
    Institusjonsopphold = 'Institusjonsopphold',
}

export enum Vurderingstatus {
    IkkeVurdert = 'IkkeVurdert',
    Vurdert = 'Vurdert',
}

export interface BosituasjonRequest {
    sakId: string;
    revurderingId: string;
    bosituasjoner: Array<{
        periode: {
            fraOgMed: string;
            tilOgMed: string;
        };
        epsFnr: Nullable<string>;
        delerBolig: Nullable<boolean>;
        erEPSUførFlyktning: Nullable<boolean>;
    }>;
}

export interface UtenlandsoppholdRequest {
    sakId: string;
    revurderingId: string;
    utenlandsopphold: Utenlandsperiode[];
}

export interface OpplysningspliktRequest {
    id: string;
    type: string;
    data: Array<{
        periode: {
            fraOgMed: string;
            tilOgMed: string;
        };
        beskrivelse: Nullable<string>;
    }>;
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
}>;

export interface FormuegrunnlagRequest {
    sakId: string;
    revurderingId: string;
    formue: FormuegrunnlagFormue;
}

export interface FlyktningVilkårRequest {
    sakId: string;
    behandlingId: string;
    vurderinger: FlyktningRequest[];
}

export interface FastOppholdVilkårRequest {
    sakId: string;
    revurderingId: string;
    vurderinger: FastOppholdVurderingRequest[];
}

export interface InstitusjonsoppholdVilkårRequest {
    sakId: string;
    revurderingId: string;
    vurderingsperioder: InstitusjonsoppholdVurderingRequest[];
}

export interface PersonligOppmøteVilkårRequest {
    sakId: string;
    revurderingId: string;
    vurderinger: PersonligOppmøteVurderingRequest[];
}

export interface RevurderingStegProps {
    sakId: string;
    revurdering: InformasjonsRevurdering;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
    onTilbakeClickOverride?: () => void;
    forrigeUrl: string;
    nesteUrl: string;
    avsluttUrl: string;
}

export interface Tilbakekrevingsbehandling {
    avgjørelse: TilbakekrevingsAvgjørelse;
}

export enum TilbakekrevingsAvgjørelse {
    IKKE_AVGJORT = 'IKKE_AVGJORT',
    TILBAKEKREV = 'TILBAKEKREV',
    IKKE_TILBAKEKREV = 'IKKE_TILBAKEKREV',
}

export interface ResultatEtterForhåndsvarselRequest {
    sakId: string;
    revurderingId: string;
    valg: BeslutningEtterForhåndsvarsling;
    begrunnelse: string;
    fritekstTilBrev: Nullable<string>;
}
