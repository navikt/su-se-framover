import { Simulering } from './Simulering';

export interface Utbetaling {
    id: string;
    opprettet: string;
    simulering: Simulering;
}
