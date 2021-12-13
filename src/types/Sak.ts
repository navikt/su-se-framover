import { Nullable } from '~lib/types';
import { Utbetalingsperiode } from '~types/Utbetalingsperiode';

import { Behandling } from './Behandling';
import { Klage } from './Klage';
import { Periode } from './Periode';
import { Revurdering } from './Revurdering';
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
    revurderinger: Revurdering[];
    vedtak: Vedtak[];
    klager: Klage[];
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
