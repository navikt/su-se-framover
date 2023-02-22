import { Person } from '~src/types/Person';
import { Sak } from '~src/types/Sak';

export interface SaksoversiktContext {
    sak: Sak;
    søker: Person;
}
