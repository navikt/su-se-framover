import { Utbetalingsperiode } from '~types/Utbetalingsperiode';

import { Behandling } from './Behandling';
import { Revurdering } from './Revurdering';
import { Søknad } from './Søknad';

export interface Sak {
    id: string;
    saksnummer: number;
    fnr: string;
    behandlinger: Behandling[];
    søknader: Søknad[];
    utbetalinger: Utbetalingsperiode[];
    utbetalingerKanStansesEllerGjenopptas: KanStansesEllerGjenopptas;
    revurderinger: Revurdering[];
}

export enum KanStansesEllerGjenopptas {
    STANS = 'STANS',
    GJENOPPTA = 'GJENOPPTA',
    INGEN = 'INGEN',
}
