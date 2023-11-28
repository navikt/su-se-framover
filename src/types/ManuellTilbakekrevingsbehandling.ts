import { Nullable } from '~src/lib/types';

import { Attestering, UnderkjennelseGrunn } from './Behandling';
import { Kravgrunnlag } from './Kravgrunnlag';
import { Periode } from './Periode';

export interface ManuellTilbakekrevingsbehandling {
    id: string;
    sakId: string;
    opprettet: string;
    opprettetAv: string;
    kravgrunnlag: Kravgrunnlag;
    status: TilbakekrevingsbehandlingStatus;
    vurderinger: Nullable<VurderingMedKrav>;
    forhåndsvarselsInfo: ForhåndsvarselsInfo[];
    fritekst: Nullable<string>;
    versjon: number;
    sendtTilAttesteringAv: Nullable<string>;
    attesteringer: Attestering[];
    erKravgrunnlagUtdatert: boolean;
    avsluttetTidspunkt: string;
}

export interface ForhåndsvarselsInfo {
    id: string;
    hendelsestidspunkt: string;
}

export enum TilbakekrevingsbehandlingStatus {
    OPPRETTET = 'OPPRETTET',
    FORHÅNDSVARSLET = 'FORHÅNDSVARSLET',
    VURDERT = 'VURDERT',
    VEDTAKSBREV = 'VEDTAKSBREV',
    TIL_ATTESTERING = 'TIL_ATTESTERING',
    IVERKSATT = 'IVERKSATT',
    AVBRUTT = 'AVBRUTT',
    UNDERKJENT = 'UNDERKJENT',
}

/**
 * bruttoSkalTilbakekreveSummert, nettoSkalTilbakekreveSummert, bruttoSkalIkkeTilbakekreveSummert er summen av alle periodene
 */
export interface VurderingMedKrav {
    perioder: VurderingMedKravForPeriode[];
    eksternKravgrunnlagId: string;
    eksternVedtakId: string;
    eksternKontrollfelt: string;
    bruttoSkalTilbakekreveSummert: number;
    nettoSkalTilbakekreveSummert: number;
    bruttoSkalIkkeTilbakekreveSummert: number;
    betaltSkattForYtelsesgruppenSummert: number;
    bruttoNyUtbetalingSummert: number;
    bruttoTidligereUtbetaltSummert: number;
}

/**
 * beløpene + skatt er de samme som man skal finne på kravgrunnlaget
 */
export interface VurderingMedKravForPeriode {
    periode: Periode<string>;
    vurdering: TilbakekrevingsVurdering;
    betaltSkattForYtelsesgruppen: number;
    bruttoTidligereUtbetalt: number;
    bruttoNyUtbetaling: number;
    bruttoSkalTilbakekreve: number;
    nettoSkalTilbakekreve: number;
    bruttoSkalIkkeTilbakekreve: number;
    skatteProsent: string;
}

export enum TilbakekrevingsVurdering {
    SKAL_TILBAKEKREVES = 'SkalTilbakekreve',
    SKAL_IKKE_TILBAKEKREVES = 'SkalIkkeTilbakekreve',
}

export interface OpprettNyTilbakekrevingsbehandlingRequest {
    sakId: string;
    versjon: number;
}

export interface VurderTilbakekrevingsbehandlingRequest {
    sakId: string;
    versjon: number;
    behandlingId: string;
    perioder: Array<{ periode: Periode<string>; vurdering: TilbakekrevingsVurdering }>;
}

export interface ForhåndsvarsleTilbakekrevingRequest {
    sakId: string;
    saksversjon: number;
    behandlingId: string;
    fritekst: string;
}

export interface BrevtekstTilbakekrevingsbehandlingRequest {
    sakId: string;
    saksversjon: number;
    behandlingId: string;
    brevtekst: Nullable<string>;
}

export interface ForhåndsvisVedtaksbrevTilbakekrevingsbehandlingRequest {
    sakId: string;
    behandlingId: string;
}

export interface ForhåndsvisBrevtekstTilbakekrevingsbehandlingRequest {
    sakId: string;
    saksversjon: number;
    behandlingId: string;
    brevtekst: Nullable<string>;
}

export interface VisUtsendtForhåndsvarselTilbakekrevingsbehandlingRequest {
    sakId: string;
    behandlingId: string;
    dokumentId: string;
}

export interface SendTilbakekrevingTilAttesteringRequest {
    versjon: number;
    sakId: string;
    behandlingId: string;
}

export interface IverksettTilbakekrevingRequest {
    versjon: number;
    sakId: string;
    behandlingId: string;
}

export interface UnderkjennTilbakekrevingRequest {
    versjon: number;
    sakId: string;
    behandlingId: string;
    kommentar: string;
    grunn: UnderkjennelseGrunn;
}
export interface AvsluttTilbakekrevingRequest {
    versjon: number;
    sakId: string;
    behandlingId: string;
    begrunnelse: string;
}

export interface OppdaterKravgrunnlagTilbakekrevingRequest {
    sakId: string;
    behandlingId: string;
    versjon: number;
}

export enum TilbakekrevingSteg {
    Forhåndsvarsling = 'forhandsvarsling',
    Vurdering = 'vurdering',
    Vedtaksbrev = 'brev',
}
