import { Nullable } from '~lib/types';
import { Utbetalingsperiode } from '~types/Utbetalingsperiode';

import { Behandling } from './Behandling';
import { Periode } from './Periode';
import { AbstraktRevurdering } from './Revurdering';
import { Søknad } from './Søknad';
import { Vedtak } from './Vedtak';

export interface Sak {
    id: string;
    saksnummer: number;
    fnr: string;
    behandlinger: Behandling[];
    søknader: Søknad[];
    utbetalinger: Utbetalingsperiode[];
    utbetalingerKanStansesEllerGjenopptas: KanStansesEllerGjenopptas;
    revurderinger: AbstraktRevurdering[];
    vedtak: Vedtak[];
}

export enum KanStansesEllerGjenopptas {
    STANS = 'STANS',
    GJENOPPTA = 'GJENOPPTA',
    INGEN = 'INGEN',
}

export interface BegrensetSakinfo {
    harÅpenSøknad: boolean;
    iverksattInnvilgetStønadsperiode: Nullable<Periode<string>>;
}
