import { Kravgrunnlag } from './Kravgrunnlag';

export interface ManuellTilbakekrevingsbehandling {
    id: string;
    opprettet: string;
    sakId: string;
    kravgrunnlag: Kravgrunnlag;
}

export enum TilbakekrevingsValg {
    SKAL_TILBAKEKREVES = 'SkalIkkeTilbakekreve',
    SKAL_IKKE_TILBAKEKREVES = 'SkalTilbakekreve',
}
