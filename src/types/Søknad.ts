import { Nullable } from '~src/lib/types';

import { SøknadInnhold } from './Søknadinnhold';
import { Dokumenttilstand } from './Vedtak';

export interface Søknad {
    id: string;
    sakId: string;
    søknadInnhold: SøknadInnhold;
    opprettet: string;
    lukket: Nullable<Lukket>;
}

export interface Lukket {
    tidspunkt: string;
    saksbehandler: Saksbehandler;
    type: LukkSøknadBegrunnelse;
    dokumenttilstand: Dokumenttilstand;
}

export enum LukkSøknadBegrunnelse {
    Trukket = 'TRUKKET',
    Bortfalt = 'BORTFALT',
    Avvist = 'AVVIST',
}

interface Saksbehandler {
    navIdent: string;
}
