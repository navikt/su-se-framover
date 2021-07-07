import { Utbetalingsperiode } from '~types/Utbetalingsperiode';

import { Behandling } from './Behandling';
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
}

export enum KanStansesEllerGjenopptas {
    STANS = 'STANS',
    GJENOPPTA = 'GJENOPPTA',
    INGEN = 'INGEN',
}

export interface ÅpenBehandling {
    saksnummer: string;
    behandlingId: string;
    typeBehandling: ÅpenBehandlingType;
    status: ÅpenBehandlingStatus;
    opprettet: string;
}

export enum ÅpenBehandlingType {
    SØKNADSBEHANDLING = 'SØKNADSBEHANDLING',
    REVURDERING = 'REVURDERING',
}

export enum ÅpenBehandlingStatus {
    UNDER_BEHANDLING = 'UNDER_BEHANDLING',
    NY_SØKNAD = 'NY_SØKNAD',
    UNDERKJENT = 'UNDERKJENT',
    TIL_ATTESTERING = 'TIL_ATTESTERING',
}
