import { FormueStatus } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Utenlandsoppholdstatus } from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { Søknadsbehandling, SøknadsbehandlingStatus } from '~src/types/Søknadsbehandling';
import { Vilkårstatus } from '~src/types/Vilkår';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import {
    mapToVilkårsinformasjon,
    vilkårsinformasjonForBeregningssteg,
} from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

export const erTilAttestering = ({ status }: Søknadsbehandling) =>
    [SøknadsbehandlingStatus.TIL_ATTESTERING_AVSLAG, SøknadsbehandlingStatus.TIL_ATTESTERING_INNVILGET].includes(
        status
    );

export const erIverksatt = ({ status }: Søknadsbehandling) =>
    [SøknadsbehandlingStatus.IVERKSATT_AVSLAG, SøknadsbehandlingStatus.IVERKSATT_INNVILGET].includes(status);

export const erAvslått = ({ status }: Søknadsbehandling) =>
    [
        SøknadsbehandlingStatus.TIL_ATTESTERING_AVSLAG,
        SøknadsbehandlingStatus.VILKÅRSVURDERT_AVSLAG,
        SøknadsbehandlingStatus.BEREGNET_AVSLAG,
        SøknadsbehandlingStatus.UNDERKJENT_AVSLAG,
        SøknadsbehandlingStatus.IVERKSATT_AVSLAG,
    ].includes(status);

export const erBeregnetAvslag = (behandling: Søknadsbehandling) =>
    behandling.beregning != null &&
    [SøknadsbehandlingStatus.BEREGNET_AVSLAG, SøknadsbehandlingStatus.UNDERKJENT_AVSLAG].includes(behandling.status);

export const kanSimuleres = (behandling: Søknadsbehandling) =>
    behandling.beregning != null &&
    [
        SøknadsbehandlingStatus.BEREGNET_INNVILGET,
        SøknadsbehandlingStatus.SIMULERT,
        SøknadsbehandlingStatus.UNDERKJENT_INNVILGET,
    ].includes(behandling.status);

export const erSimulert = (behandling: Søknadsbehandling) =>
    behandling.simulering != null && behandling.status === SøknadsbehandlingStatus.SIMULERT;

export const erUnderkjent = ({ status }: Søknadsbehandling) =>
    [SøknadsbehandlingStatus.UNDERKJENT_INNVILGET, SøknadsbehandlingStatus.UNDERKJENT_AVSLAG].includes(status);

export const erVilkårsvurderingerVurdertAvslag = (behandling: Søknadsbehandling) =>
    behandling.status === SøknadsbehandlingStatus.VILKÅRSVURDERT_AVSLAG ||
    behandling.grunnlagsdataOgVilkårsvurderinger.uføre?.resultat === UføreResultat.VilkårIkkeOppfylt ||
    behandling.grunnlagsdataOgVilkårsvurderinger.flyktning?.resultat === Vilkårstatus.VilkårIkkeOppfylt ||
    behandling.grunnlagsdataOgVilkårsvurderinger.lovligOpphold?.resultat === Vilkårstatus.VilkårIkkeOppfylt ||
    behandling.grunnlagsdataOgVilkårsvurderinger.fastOpphold?.resultat === Vilkårstatus.VilkårIkkeOppfylt ||
    behandling.grunnlagsdataOgVilkårsvurderinger.institusjonsopphold?.resultat === Vilkårstatus.VilkårIkkeOppfylt ||
    behandling.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold?.status ===
        Utenlandsoppholdstatus.SkalVæreMerEnn90DagerIUtlandet ||
    behandling.grunnlagsdataOgVilkårsvurderinger.formue?.resultat === FormueStatus.VilkårIkkeOppfylt ||
    behandling.grunnlagsdataOgVilkårsvurderinger.personligOppmøte?.resultat === Vilkårstatus.VilkårIkkeOppfylt;

const hentSaksbehandlingssteg = (behandling: Søknadsbehandling) => {
    const vilkårsinformasjon = mapToVilkårsinformasjon(
        behandling.søknad.søknadInnhold.type,
        behandling.grunnlagsdataOgVilkårsvurderinger
    );
    const satsOgBeregningssteg = vilkårsinformasjonForBeregningssteg(behandling);
    return [...vilkårsinformasjon, ...satsOgBeregningssteg];
};

export const hentSisteVurdertSaksbehandlingssteg = (behandling: Søknadsbehandling) => {
    const påbegynteSteg = hentSaksbehandlingssteg(behandling).filter((steg) => steg.erStartet);
    return [...påbegynteSteg].pop()?.vilkårtype ?? Vilkårtype.Virkningstidspunkt;
};
