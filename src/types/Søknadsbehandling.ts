import { Nullable } from '~src/lib/types';
import { Periode } from '~src/types/Periode';
import { Simulering } from '~src/types/Simulering';

import { Behandling } from './Behandling';
import { Beregning } from './Beregning';
import { Søknad } from './Søknad';

export interface Søknadsbehandling extends Behandling<SøknadsbehandlingStatus> {
    sakId: string;
    søknad: Søknad;
    beregning: Nullable<Beregning>;
    simulering: Nullable<Simulering>;
    saksbehandler: Nullable<string>;
    stønadsperiode: Nullable<Stønadsperiode>;
    fritekstTilBrev: string;
    simuleringForAvkortingsvarsel: Nullable<Simulering>;
    erLukket: boolean;
}

export interface Stønadsperiode {
    periode: Periode<string>;
}

export enum SøknadsbehandlingStatus {
    OPPRETTET = 'OPPRETTET',
    VILKÅRSVURDERT_INNVILGET = 'VILKÅRSVURDERT_INNVILGET',
    VILKÅRSVURDERT_AVSLAG = 'VILKÅRSVURDERT_AVSLAG',
    BEREGNET_INNVILGET = 'BEREGNET_INNVILGET',
    BEREGNET_AVSLAG = 'BEREGNET_AVSLAG',
    SIMULERT = 'SIMULERT',
    TIL_ATTESTERING_INNVILGET = 'TIL_ATTESTERING_INNVILGET',
    TIL_ATTESTERING_AVSLAG = 'TIL_ATTESTERING_AVSLAG',
    UNDERKJENT_INNVILGET = 'UNDERKJENT_INNVILGET',
    UNDERKJENT_AVSLAG = 'UNDERKJENT_AVSLAG',
    IVERKSATT_INNVILGET = 'IVERKSATT_INNVILGET',
    IVERKSATT_AVSLAG = 'IVERKSATT_AVSLAG',
}
