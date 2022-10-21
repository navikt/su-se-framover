import { Nullable } from '~src/lib/types';
import { Utbetalingsperiode } from '~src/types/Utbetalingsperiode';

import { Klage } from './Klage';
import { Periode } from './Periode';
import { RegistrerteUtenlandsopphold } from './RegistrertUtenlandsopphold';
import { Regulering } from './Regulering';
import { Revurdering } from './Revurdering';
import { Søknad } from './Søknad';
import { Søknadsbehandling } from './Søknadsbehandling';
import { Vedtak } from './Vedtak';
import { VedtakPåTidslinje } from './VedtakPåTidslinje';

export interface Sak {
    id: string;
    saksnummer: number;
    fnr: string;
    behandlinger: Søknadsbehandling[];
    søknader: Søknad[];
    utbetalinger: Utbetalingsperiode[];
    utbetalingerKanStansesEllerGjenopptas: KanStansesEllerGjenopptas;
    revurderinger: Revurdering[];
    vedtak: Vedtak[];
    klager: Klage[];
    reguleringer: Regulering[];
    sakstype: Sakstype;
    vedtakPåTidslinje: VedtakPåTidslinje[];
    utenlandsopphold: RegistrerteUtenlandsopphold;
    versjon: number;
}

export enum KanStansesEllerGjenopptas {
    STANS = 'STANS',
    GJENOPPTA = 'GJENOPPTA',
    INGEN = 'INGEN',
}

export interface AlleredeGjeldendeSakForBruker {
    uføre: BegrensetSakInfo;
    alder: BegrensetSakInfo;
}

export interface BegrensetSakInfo {
    harÅpenSøknad: boolean;
    iverksattInnvilgetStønadsperiode: Nullable<Periode<string>>;
}

export enum Sakstype {
    Alder = 'alder',
    Uføre = 'uføre',
}
