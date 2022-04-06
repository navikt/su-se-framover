import { Nullable } from '~src/lib/types';

export interface Kontrollsamtale {
    id: string;
    opprettet: string;
    sakId: string;
    innkallingsdato: string;
    status: string;
    frist: Nullable<string>;
    dokumentId: Nullable<string>;
}
