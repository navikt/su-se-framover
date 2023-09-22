import { Kravgrunnlag } from './Kravgrunnlag';

export interface ManuellTilbakekrevingsbehandling {
    id: string;
    opprettet: string;
    sakId: string;
    kravgrunnlag: Kravgrunnlag;
}

export enum TilbakekrevingsValg {
    SKAL_TILBAKEKREVES = 'SKAL_TILBAKEKREVES',
    SKAL_IKKE_TILBAKEKREVES = 'SKAL_IKKE_TILBAKEKREVES',
}
