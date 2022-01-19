import { Nullable } from '~lib/types';
import { Simulering } from '~types/Simulering';

import { Behandlingsinformasjon } from './Behandlingsinformasjon';
import { Beregning } from './Beregning';
import { GrunnlagsdataOgVilkårsvurderinger } from './grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { Søknad } from './Søknad';

export interface Behandling {
    id: string;
    sakId: string;
    søknad: Søknad;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
    behandlingsinformasjon: Behandlingsinformasjon;
    beregning: Nullable<Beregning>;
    status: Behandlingsstatus;
    simulering: Nullable<Simulering>;
    opprettet: string;
    attesteringer: Attestering[];
    saksbehandler: Nullable<string>;
    hendelser: Nullable<Hendelse[]>;
    satsBeløp: Nullable<number>;
    stønadsperiode: Nullable<Behandlingsperiode>;
    fritekstTilBrev: string;
}

export interface Behandlingsperiode {
    periode: {
        fraOgMed: Nullable<string>;
        tilOgMed: Nullable<string>;
    };
    begrunnelse: Nullable<string>;
}
interface Stønadsperiode {
    periode: {
        fraOgMed: string;
        tilOgMed: string;
    };
    begrunnelse: string;
}
export interface IverksattInnvilgetBehandling extends Behandling {
    stønadsperiode: Stønadsperiode;
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
    opprettet: string;
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

export const underkjennelsesGrunnTextMapper: { [key in UnderkjennelseGrunn]: string } = {
    [UnderkjennelseGrunn.ANDRE_FORHOLD]: 'Andre forhold',
    [UnderkjennelseGrunn.BEREGNINGEN_ER_FEIL]: 'Beregningen er feil',
    [UnderkjennelseGrunn.DOKUMENTASJON_MANGLER]: 'Dokumentasjon mangler',
    [UnderkjennelseGrunn.INNGANGSVILKÅRENE_ER_FEILVURDERT]: 'Inngangsvilkårene er feilvurdert',
    [UnderkjennelseGrunn.VEDTAKSBREVET_ER_FEIL]: 'Vedtaksbrev er feil',
};
