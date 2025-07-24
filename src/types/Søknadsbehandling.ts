import { Nullable } from '~src/lib/types';
import { Periode } from '~src/types/Periode';
import { OmgjøringsGrunn, OmgjøringsÅrsak } from '~src/types/Revurdering.ts';
import { Simulering } from '~src/types/Simulering';

import { Aldersvurdering } from './Aldersvurdering';
import { Behandling } from './Behandling';
import { Beregning } from './Beregning';
import { EksterneGrunnlag } from './EksterneGrunnlag';
import { GrunnlagsdataOgVilkårsvurderinger } from './grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { Søknad } from './Søknad';

export interface Søknadsbehandling extends Behandling<SøknadsbehandlingStatus> {
    sakId: string;
    søknad: Søknad;
    beregning: Nullable<Beregning>;
    simulering: Nullable<Simulering>;
    saksbehandler: Nullable<string>;
    stønadsperiode: Nullable<Stønadsperiode>;
    fritekstTilBrev: string;
    erLukket: boolean;
    aldersvurdering: Nullable<Aldersvurdering>;
    eksterneGrunnlag: EksterneGrunnlag;
    omgjøringsårsak: Nullable<OmgjøringsÅrsak>;
    omgjøringsgrunn: Nullable<OmgjøringsGrunn>;
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

export enum SaksbehandlingMenyvalg {
    Sak = 'sak',
    Søknad = 'soknad',
    Vilkår = 'vilkar',
    Beregning = 'beregning',
    Vedtak = 'vedtak',
    Vedtaksbrev = 'vedtaksbrev',
    Oppsummering = 'oppsummering',
}

export interface SkattegrunnlagSøknadsbehandlingRequest {
    sakId: string;
    behandlingId: string;
    fra: string;
    til: string;
}

export interface EksisterendeVedtaksinformasjonTidligerePeriodeRequest {
    sakId: string;
    behandlingId: string;
}

export interface EksisterendeVedtaksinformasjonTidligerePeriodeResponse {
    periode: Periode<string>;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}
