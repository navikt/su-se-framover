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
    attestering: Nullable<Attestering>;
    saksbehandler: Nullable<string>;
    hendelser: Nullable<Hendelse[]>;
    satsBeløp: Nullable<number>;
    behandlingsperiode: Nullable<Behandlingsperiode>;
}

export interface Behandlingsperiode {
    periode: {
        fraOgMed: Nullable<string>;
        tilOgMed: Nullable<string>;
    };
    begrunnelse: Nullable<string>;
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
    UNDERKJENT_INNVILGET = 'UNDERKJENT_INNVILGET',
    UNDERKJENT_AVSLAG = 'UNDERKJENT_AVSLAG',
    IVERKSATT_INNVILGET = 'IVERKSATT_INNVILGET',
    IVERKSATT_AVSLAG = 'IVERKSATT_AVSLAG',
}

export interface Hendelse {
    overskrift: string;
    underoverskrift: string;
    tidspunkt: string;
    melding: string;
}

export interface Attestering {
    attestant: string;
    underkjennelse: Nullable<Underkjennelse>;
}

export interface Underkjennelse {
    grunn: UnderkjennelseGrunn;
    kommentar: string;
}

export enum UnderkjennelseGrunn {
    INNGANGSVILKÅRENE_ER_FEILVURDERT = 'INNGANGSVILKÅRENE_ER_FEILVURDERT',
    BEREGNINGEN_ER_FEIL = 'BEREGNINGEN_ER_FEIL',
    DOKUMENTASJON_MANGLER = 'DOKUMENTASJON_MANGLER',
    VEDTAKSBREVET_ER_FEIL = 'VEDTAKSBREVET_ER_FEIL',
    ANDRE_FORHOLD = 'ANDRE_FORHOLD',
}
