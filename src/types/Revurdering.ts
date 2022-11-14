import { Nullable } from '~src/lib/types';

import { Behandling } from './Behandling';
import { Beregning } from './Beregning';
import { GrunnlagsdataOgVilkårsvurderinger } from './grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { Periode } from './Periode';
import { Simulering, SimulertPeriode } from './Simulering';

//Dette er feltene som deles av backends 'abstrakte' revurdering. Hadde vært fint å skille på dem litt mer, både bak og fram
export interface Revurdering<T extends RevurderingStatus = RevurderingStatus> extends Behandling<RevurderingStatus> {
    status: T;
    periode: Periode<string>;
    saksbehandler: string;
    årsak: OpprettetRevurderingGrunn;
    begrunnelse: Nullable<string>;
}

/**
 * Dette gjelder kun de revurderingene som kun endrer på utbetalingene
 * eksempler: stans og gjenoppta
 */
export interface UtbetalingsRevurdering<T extends UtbetalingsRevurderingStatus = UtbetalingsRevurderingStatus>
    extends Revurdering {
    status: T;
}

export interface StansAvYtelse<
    T extends UtbetalingsRevurderingStatus =
        | UtbetalingsRevurderingStatus.SIMULERT_STANS
        | UtbetalingsRevurderingStatus.IVERKSATT_STANS
        | UtbetalingsRevurderingStatus.AVSLUTTET_STANS
> extends UtbetalingsRevurdering<UtbetalingsRevurderingStatus> {
    status: T;
    simulering: Simulering;
}

export interface AvsluttetStans extends StansAvYtelse<UtbetalingsRevurderingStatus.AVSLUTTET_STANS> {
    avsluttetTidspunkt: string;
}

export interface Gjenopptak<
    T extends UtbetalingsRevurderingStatus =
        | UtbetalingsRevurderingStatus.SIMULERT_GJENOPPTAK
        | UtbetalingsRevurderingStatus.AVSLUTTET_GJENOPPTAK
        | UtbetalingsRevurderingStatus.IVERKSATT_GJENOPPTAK
> extends UtbetalingsRevurdering<UtbetalingsRevurderingStatus> {
    status: T;
    simulering: Simulering;
}

export interface AvsluttetGjenopptak extends Gjenopptak<UtbetalingsRevurderingStatus.AVSLUTTET_GJENOPPTAK> {
    avsluttetTidspunkt: string;
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
    brevvalg: BrevvalgRevurdering;
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
    avsluttetTidspunkt: string;
}

export type RevurderingStatus = InformasjonsRevurderingStatus | UtbetalingsRevurderingStatus;

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

export interface OpprettRevurderingRequest {
    sakId: string;
    periode: {
        fraOgMed: Date;
        tilOgMed: Date;
    };
    årsak: OpprettetRevurderingGrunn;
    informasjonSomRevurderes: InformasjonSomRevurderes[];
    begrunnelse: string;
}

export interface OppdaterRevurderingRequest extends OpprettRevurderingRequest {
    revurderingId: string;
}

export interface BrevvalgRevurdering {
    valg: Valg;
    fritekst: Nullable<string>;
    begrunnelse: Nullable<string>;
}
export enum Valg {
    SEND = 'SEND',
    IKKE_SEND = 'IKKE_SEND',
    IKKE_VALGT = 'IKKE_VALGT',
}
