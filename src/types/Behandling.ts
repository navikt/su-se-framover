import { Nullable } from '~lib/types';
import { Simulering } from '~types/Simulering';

import { Behandlingsinformasjon } from './Behandlingsinformasjon';
import { Beregning } from './Beregning';
import { Søknad } from './Søknad';
import { Vilkårsvurderinger } from './Vilkårsvurdering';

export interface Behandling {
    id: string;
    søknad: Søknad;
    vilkårsvurderinger: Vilkårsvurderinger;
    behandlingsinformasjon: Behandlingsinformasjon;
    beregning: Nullable<Beregning>;
    status: Behandlingsstatus;
    simulering: Nullable<Simulering>;
    opprettet: string;
    attestant: Nullable<string>;
    saksbehandler: Nullable<string>;
    hendelser: Nullable<Hendelse[]>;
    satsBeløp: Nullable<number>;
}

export enum Behandlingsstatus {
    OPPRETTET = 'OPPRETTET',
    VILKÅRSVURDERT_INNVILGET = 'VILKÅRSVURDERT_INNVILGET',
    VILKÅRSVURDERT_AVSLAG = 'VILKÅRSVURDERT_AVSLAG',
    BEREGNET_INNVILGET = 'BEREGNET_INNVILGET',
    BEREGNET_AVSLAG = 'BEREGNET_AVSLAG',
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
