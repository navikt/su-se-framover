import { Kravgrunnlag } from './Kravgrunnlag';

export interface ManuellTilbakekrevingsbehandling {
    id: string;
    opprettet: string;
    sakId: string;
    kravgrunnlag: Kravgrunnlag;
}
