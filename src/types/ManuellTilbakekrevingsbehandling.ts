import { Nullable } from '~src/lib/types';

import { Kravgrunnlag } from './Kravgrunnlag';

export interface ManuellTilbakekrevingsbehandling {
    id: string;
    sakId: string;
    opprettet: string;
    opprettetAv: string;
    kravgrunnlag: Kravgrunnlag;
    status: TilbakekrevingsbehandlingStatus;
    månedsvurderinger: Månedsvurdering[];
    dokumenter: string[];
    fritekst: Nullable<string>;
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
    brevtekst: string;
}

export interface ForhåndsvisBrevtekstTilbakekrevingsbehandlingRequest {
    sakId: string;
    saksversjon: number;
    behandlingId: string;
    brevtekst: Nullable<string>;
}
