import { Behandling } from './Behandling';
import { Søknad } from './Søknad';

export interface Sak {
    id: string;
    fnr: string;
    behandlinger: Behandling[];
    søknader: Søknad[];
}
