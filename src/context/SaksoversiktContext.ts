import { Person } from '~src/api/personApi';
import { Sak } from '~src/types/Sak';

export interface SaksoversiktContext {
    sak: Sak;
    søker: Person;
}
