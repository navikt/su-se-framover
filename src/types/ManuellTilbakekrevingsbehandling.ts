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
    fritekst: Nullable<string>;
}

export enum TilbakekrevingsbehandlingStatus {
    OPPRETTET = 'OPPRETTET',
    VURDERT_UTEN_BREV = 'VURDERT_UTEN_BREV',
    VURDERT_MED_BREV = 'VURDERT_MED_BREV',
    TIL_ATTESTERING = 'TIL_ATTESTERING',
    IVERKSATT = 'IVERKSATT',
}

export interface Månedsvurdering {
    måned: string;
    vurdering: TilbakekrevingsVurdering;
}

export interface OpprettNyTilbakekrevingsbehandlingRequest {
    sakId: string;
    saksversjon: number;
}

export enum TilbakekrevingsVurdering {
    SKAL_TILBAKEKREVES = 'SkalTilbakekreve',
    SKAL_IKKE_TILBAKEKREVES = 'SkalIkkeTilbakekreve',
}

export interface VurderTilbakekrevingsbehandlingRequest {
    sakId: string;
    saksversjon: number;
    behandlingId: string;
    måneder: Array<{ måned: string; vurdering: TilbakekrevingsVurdering }>;
}
