import { Nullable } from '~src/lib/types';
import { Utbetalingsperiode } from '~src/types/Utbetalingsperiode';

import { Behandling } from './Behandling';
import { Klage } from './Klage';
import { Periode } from './Periode';
import { Regulering } from './Regulering';
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
    reguleringer: Regulering[];
}

export enum Sakstype {
    UFØRE = 'uføre',
    ALDER = 'alder',
}

export enum KanStansesEllerGjenopptas {
    STANS = 'STANS',
    GJENOPPTA = 'GJENOPPTA',
    INGEN = 'INGEN',
}

export interface AlleredeÅpenSak {
    uføre: ÅpenSakinfo;
    alder: ÅpenSakinfo;
}

export interface ÅpenSakinfo {
    harÅpenSøknad: boolean;
    iverksattInnvilgetStønadsperiode: Nullable<Periode<string>>;
}
