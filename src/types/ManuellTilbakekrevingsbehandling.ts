import { Nullable } from '~src/lib/types';
import { BrevvalgAvsluttTilbakekreving } from '~src/pages/saksbehandling/avsluttBehandling/avsluttTilbakekreving/AvsluttTilbakekrevingUtils';

import { Attestering, UnderkjennelseGrunn } from './Behandling';
import { Kravgrunnlag } from './Kravgrunnlag';

export interface ManuellTilbakekrevingsbehandling {
    id: string;
    sakId: string;
    opprettet: string;
    opprettetAv: string;
    kravgrunnlag: Kravgrunnlag;
    status: TilbakekrevingsbehandlingStatus;
    månedsvurderinger: Månedsvurdering[];
    forhåndsvarselsInfo: ForhåndsvarselsInfo[];
    fritekst: Nullable<string>;
    versjon: number;
    sendtTilAttesteringAv: Nullable<string>;
    attesteringer: Attestering[];
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

export interface Månedsvurdering {
    måned: string;
    vurdering: TilbakekrevingsVurdering;
}

export interface OpprettNyTilbakekrevingsbehandlingRequest {
    sakId: string;
    versjon: number;
}

export enum TilbakekrevingsVurdering {
    SKAL_TILBAKEKREVES = 'SkalTilbakekreve',
    SKAL_IKKE_TILBAKEKREVES = 'SkalIkkeTilbakekreve',
}

export interface VurderTilbakekrevingsbehandlingRequest {
    sakId: string;
    versjon: number;
    behandlingId: string;
    måneder: Array<{ måned: string; vurdering: TilbakekrevingsVurdering }>;
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
    skalSendeBrev: BrevvalgAvsluttTilbakekreving;
    fritekst: Nullable<string>;
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
