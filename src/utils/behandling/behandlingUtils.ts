import { Behandling, Behandlingsstatus } from '~types/Behandling';
import { FormueStatus, PersonligOppmøteStatus, Vilkårstatus } from '~types/Behandlingsinformasjon';
import { UføreResultat } from '~types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Utenlandsoppholdstatus } from '~types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { Sak } from '~types/Sak';
import { Vilkårtype } from '~types/Vilkårsvurdering';
import {
    mapToVilkårsinformasjon,
    vilkårsinformasjonForBeregningssteg,
} from '~utils/søknadsbehandling/vilkår/vilkårUtils';

export const findBehandling = (sak: Sak, behandlingId: string) => sak.behandlinger.find((b) => b.id === behandlingId);

export const erTilAttestering = ({ status }: Behandling) =>
    [Behandlingsstatus.TIL_ATTESTERING_AVSLAG, Behandlingsstatus.TIL_ATTESTERING_INNVILGET].includes(status);

export const erIverksatt = ({ status }: Behandling) =>
    [Behandlingsstatus.IVERKSATT_AVSLAG, Behandlingsstatus.IVERKSATT_INNVILGET].includes(status);

export const erAvslått = ({ status }: Behandling) =>
    [
        Behandlingsstatus.TIL_ATTESTERING_AVSLAG,
        Behandlingsstatus.VILKÅRSVURDERT_AVSLAG,
        Behandlingsstatus.BEREGNET_AVSLAG,
        Behandlingsstatus.UNDERKJENT_AVSLAG,
        Behandlingsstatus.IVERKSATT_AVSLAG,
    ].includes(status);

export const erBeregnetAvslag = (behandling: Behandling) =>
    behandling.beregning != null &&
    [Behandlingsstatus.BEREGNET_AVSLAG, Behandlingsstatus.UNDERKJENT_AVSLAG].includes(behandling.status);

export const kanSimuleres = (behandling: Behandling) =>
    behandling.beregning != null &&
    [Behandlingsstatus.BEREGNET_INNVILGET, Behandlingsstatus.SIMULERT, Behandlingsstatus.UNDERKJENT_INNVILGET].includes(
        behandling.status
    );

export const erSimulert = (behandling: Behandling) =>
    behandling.simulering != null && behandling.status === Behandlingsstatus.SIMULERT;

export const erUnderkjent = ({ status }: Behandling) =>
    [Behandlingsstatus.UNDERKJENT_INNVILGET, Behandlingsstatus.UNDERKJENT_AVSLAG].includes(status);

export const erVilkårsvurderingerVurdertAvslag = (behandling: Behandling) =>
    behandling.status === Behandlingsstatus.VILKÅRSVURDERT_AVSLAG ||
    behandling.grunnlagsdataOgVilkårsvurderinger.uføre?.resultat === UføreResultat.VilkårIkkeOppfylt ||
    behandling.behandlingsinformasjon.flyktning?.status === Vilkårstatus.VilkårIkkeOppfylt ||
    behandling.behandlingsinformasjon.lovligOpphold?.status === Vilkårstatus.VilkårIkkeOppfylt ||
    behandling.behandlingsinformasjon.fastOppholdINorge?.status === Vilkårstatus.VilkårIkkeOppfylt ||
    behandling.behandlingsinformasjon.institusjonsopphold?.status === Vilkårstatus.VilkårIkkeOppfylt ||
    behandling.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold?.status ===
        Utenlandsoppholdstatus.SkalVæreMerEnn90DagerIUtlandet ||
    behandling.behandlingsinformasjon.formue?.status === FormueStatus.VilkårIkkeOppfylt ||
    behandling.behandlingsinformasjon.personligOppmøte?.status === PersonligOppmøteStatus.IkkeMøttPersonlig;

const hentSaksbehandlingssteg = (behandling: Behandling) => {
    const vilkårsinformasjon = mapToVilkårsinformasjon(
        behandling.behandlingsinformasjon,
        behandling.grunnlagsdataOgVilkårsvurderinger
    );
    const satsOgBeregningssteg = vilkårsinformasjonForBeregningssteg(behandling);
    return [...vilkårsinformasjon, ...satsOgBeregningssteg];
};

export const hentSisteVurdertSaksbehandlingssteg = (behandling: Behandling) => {
    const påbegynteSteg = hentSaksbehandlingssteg(behandling).filter((steg) => steg.erStartet);
    return [...påbegynteSteg].pop()?.vilkårtype ?? Vilkårtype.Virkningstidspunkt;
};
