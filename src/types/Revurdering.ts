import { Behandling } from './Behandling';

export interface OpprettetRevurdering {
    id: string;
    opprettet: string;
    tilRevurdering: Behandling;
}
