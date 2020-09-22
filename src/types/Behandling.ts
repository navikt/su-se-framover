import { Nullable } from '~lib/types';

import { Behandlingsinformasjon } from './Behandlingsinformasjon';
import { Beregning } from './Beregning';
import { Søknad } from './Søknad';
import { Utbetaling } from './Utbetaling';
import { Vilkårsvurderinger } from './Vilkårsvurdering';

export interface Behandling {
    id: string;
    søknad: Søknad;
    vilkårsvurderinger: Vilkårsvurderinger;
    behandlingsinformasjon: Behandlingsinformasjon;
    beregning: Nullable<Beregning>;
    status: Behandlingsstatus;
    utbetaling: Nullable<Utbetaling>;
    opprettet: string;
    attestant: Nullable<string>;
    hendelser: Nullable<Array<Hendelse>>;
}

export enum Behandlingsstatus {
    OPPRETTET = 'OPPRETTET',
    VILKÅRSVURDERT_INNVILGET = 'VILKÅRSVURDERT_INNVILGET',
    VILKÅRSVURDERT_AVSLAG = 'VILKÅRSVURDERT_AVSLAG',
    BEREGNET = 'BEREGNET',
    SIMULERT = 'SIMULERT',
    TIL_ATTESTERING_INNVILGET = 'TIL_ATTESTERING_INNVILGET',
    TIL_ATTESTERING_AVSLAG = 'TIL_ATTESTERING_AVSLAG',
    IVERKSATT_INNVILGET = 'IVERKSATT_INNVILGET',
    IVERKSATT_AVSLAG = 'IVERKSATT_AVSLAG',
}

export interface Hendelse {
    overskrift: string;
    underoverskrift: string;
    tidspunkt: string;
    melding: string;
}
