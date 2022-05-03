import { Person } from '~src/api/personApi';
import { Sak } from '~src/types/Sak';

export interface AttesteringContext {
    sak: Sak;
    søker: Person;
}
