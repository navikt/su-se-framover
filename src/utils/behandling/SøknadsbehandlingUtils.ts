import { FormueStatus, Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Utenlandsoppholdstatus } from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { Søknadsbehandling, Behandlingsstatus } from '~src/types/Søknadsbehandling';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import {
    mapToVilkårsinformasjon,
    vilkårsinformasjonForBeregningssteg,
} from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

export const erTilAttestering = ({ status }: Søknadsbehandling) =>
    [Behandlingsstatus.TIL_ATTESTERING_AVSLAG, Behandlingsstatus.TIL_ATTESTERING_INNVILGET].includes(status);

export const erIverksatt = ({ status }: Søknadsbehandling) =>
    [Behandlingsstatus.IVERKSATT_AVSLAG, Behandlingsstatus.IVERKSATT_INNVILGET].includes(status);

export const erAvslått = ({ status }: Søknadsbehandling) =>
    [
        Behandlingsstatus.TIL_ATTESTERING_AVSLAG,
        Behandlingsstatus.VILKÅRSVURDERT_AVSLAG,
        Behandlingsstatus.BEREGNET_AVSLAG,
        Behandlingsstatus.UNDERKJENT_AVSLAG,
        Behandlingsstatus.IVERKSATT_AVSLAG,
    ].includes(status);

export const erBeregnetAvslag = (behandling: Søknadsbehandling) =>
    behandling.beregning != null &&
    [Behandlingsstatus.BEREGNET_AVSLAG, Behandlingsstatus.UNDERKJENT_AVSLAG].includes(behandling.status);

export const kanSimuleres = (behandling: Søknadsbehandling) =>
    behandling.beregning != null &&
    [Behandlingsstatus.BEREGNET_INNVILGET, Behandlingsstatus.SIMULERT, Behandlingsstatus.UNDERKJENT_INNVILGET].includes(
        behandling.status
    );

export const erSimulert = (behandling: Søknadsbehandling) =>
    behandling.simulering != null && behandling.status === Behandlingsstatus.SIMULERT;

export const erUnderkjent = ({ status }: Søknadsbehandling) =>
    [Behandlingsstatus.UNDERKJENT_INNVILGET, Behandlingsstatus.UNDERKJENT_AVSLAG].includes(status);

export const erVilkårsvurderingerVurdertAvslag = (behandling: Søknadsbehandling) =>
    behandling.status === Behandlingsstatus.VILKÅRSVURDERT_AVSLAG ||
    behandling.grunnlagsdataOgVilkårsvurderinger.uføre?.resultat === UføreResultat.VilkårIkkeOppfylt ||
    behandling.grunnlagsdataOgVilkårsvurderinger.flyktning?.resultat === Vilkårstatus.VilkårIkkeOppfylt ||
    behandling.grunnlagsdataOgVilkårsvurderinger.lovligOpphold?.resultat === Vilkårstatus.VilkårIkkeOppfylt ||
    behandling.grunnlagsdataOgVilkårsvurderinger.fastOpphold?.resultat === Vilkårstatus.VilkårIkkeOppfylt ||
    behandling.behandlingsinformasjon.institusjonsopphold?.status === Vilkårstatus.VilkårIkkeOppfylt ||
    behandling.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold?.status ===
        Utenlandsoppholdstatus.SkalVæreMerEnn90DagerIUtlandet ||
    behandling.grunnlagsdataOgVilkårsvurderinger.formue?.resultat === FormueStatus.VilkårIkkeOppfylt ||
    behandling.grunnlagsdataOgVilkårsvurderinger.personligOppmøte?.resultat === Vilkårstatus.VilkårIkkeOppfylt;

const hentSaksbehandlingssteg = (behandling: Søknadsbehandling) => {
    const vilkårsinformasjon = mapToVilkårsinformasjon(
        behandling.søknad.søknadInnhold.type,
        behandling.behandlingsinformasjon,
        behandling.grunnlagsdataOgVilkårsvurderinger
    );
    const satsOgBeregningssteg = vilkårsinformasjonForBeregningssteg(behandling);
    return [...vilkårsinformasjon, ...satsOgBeregningssteg];
};

export const hentSisteVurdertSaksbehandlingssteg = (behandling: Søknadsbehandling) => {
    const påbegynteSteg = hentSaksbehandlingssteg(behandling).filter((steg) => steg.erStartet);
    return [...påbegynteSteg].pop()?.vilkårtype ?? Vilkårtype.Virkningstidspunkt;
};
