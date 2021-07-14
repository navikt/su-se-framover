import * as Arr from 'fp-ts/Array';
import { pipe } from 'fp-ts/lib/function';
import * as Option from 'fp-ts/Option';

import { Behandling, Behandlingsstatus } from '~types/Behandling';
import {
    FastOppholdINorgeStatus,
    FlyktningStatus,
    FormueStatus,
    InstitusjonsoppholdStatus,
    LovligOppholdStatus,
    OppholdIUtlandetStatus,
    PersonligOppmøteStatus,
    UførhetStatus,
} from '~types/Behandlingsinformasjon';
import { Sak } from '~types/Sak';
import { Vilkårtype } from '~types/Vilkårsvurdering';
import {
    mapToVilkårsinformasjon,
    Vilkårsinformasjon,
    vilkårsinformasjonForBeregningssteg,
} from '~Utils/søknadsbehandling/vilkår/vilkårUtils';

export const findBehandling = (sak: Sak, behandlingId: string) => {
    return sak.behandlinger.find((b) => b.id === behandlingId);
};

export function erTilAttestering(behandling: Behandling): boolean {
    return [Behandlingsstatus.TIL_ATTESTERING_AVSLAG, Behandlingsstatus.TIL_ATTESTERING_INNVILGET].some(
        (status) => behandling.status === status
    );
}

export function erIverksatt(behandling: Behandling): boolean {
    return [Behandlingsstatus.IVERKSATT_AVSLAG, Behandlingsstatus.IVERKSATT_INNVILGET].some(
        (status) => behandling.status === status
    );
}

export function erAvslått(behandling: Behandling): boolean {
    return [
        Behandlingsstatus.TIL_ATTESTERING_AVSLAG,
        Behandlingsstatus.VILKÅRSVURDERT_AVSLAG,
        Behandlingsstatus.BEREGNET_AVSLAG,
        Behandlingsstatus.UNDERKJENT_AVSLAG,
        Behandlingsstatus.IVERKSATT_AVSLAG,
    ].some((status) => behandling.status === status);
}

export function harBeregning(behandling: Behandling): boolean {
    return behandling.beregning != null;
}

export const erBeregnetAvslag = (behandling: Behandling) => {
    return (
        behandling.beregning != null &&
        (behandling.status === Behandlingsstatus.BEREGNET_AVSLAG ||
            behandling.status === Behandlingsstatus.UNDERKJENT_AVSLAG)
    );
};

export const kanSimuleres = (behandling: Behandling) => {
    return (
        behandling.beregning != null &&
        (behandling.status == Behandlingsstatus.BEREGNET_INNVILGET ||
            behandling.status == Behandlingsstatus.SIMULERT ||
            behandling.status == Behandlingsstatus.UNDERKJENT_INNVILGET)
    );
};

export const erSimulert = (behandling: Behandling) => {
    return behandling.simulering != null && behandling.status === Behandlingsstatus.SIMULERT;
};

export const erUnderkjent = (behandling: Behandling) => {
    return [Behandlingsstatus.UNDERKJENT_INNVILGET, Behandlingsstatus.UNDERKJENT_AVSLAG].some(
        (status) => behandling.status === status
    );
};

export const erVilkårsvurderingerVurdertAvslag = (behandling: Behandling) => {
    return (
        behandling.status === Behandlingsstatus.VILKÅRSVURDERT_AVSLAG ||
        behandling.behandlingsinformasjon.uførhet?.status === UførhetStatus.VilkårIkkeOppfylt ||
        behandling.behandlingsinformasjon.flyktning?.status === FlyktningStatus.VilkårIkkeOppfylt ||
        behandling.behandlingsinformasjon.lovligOpphold?.status === LovligOppholdStatus.VilkårIkkeOppfylt ||
        behandling.behandlingsinformasjon.fastOppholdINorge?.status === FastOppholdINorgeStatus.VilkårIkkeOppfylt ||
        behandling.behandlingsinformasjon.institusjonsopphold?.status === InstitusjonsoppholdStatus.VilkårIkkeOppfylt ||
        behandling.behandlingsinformasjon.oppholdIUtlandet?.status ===
            OppholdIUtlandetStatus.SkalVæreMerEnn90DagerIUtlandet ||
        behandling.behandlingsinformasjon.formue?.status === FormueStatus.VilkårIkkeOppfylt ||
        behandling.behandlingsinformasjon.personligOppmøte?.status === PersonligOppmøteStatus.IkkeMøttPersonlig
    );
};

const hentSaksbehandlingssteger = (behandling: Behandling) => {
    const vilkårsinformasjon = mapToVilkårsinformasjon(behandling.behandlingsinformasjon);
    const satsOgBeregningssteg = vilkårsinformasjonForBeregningssteg(behandling);
    return [...vilkårsinformasjon, ...satsOgBeregningssteg];
};

export const hentSisteVurdertSaksbehandlingssteg = (behandling: Behandling) => {
    return pipe(
        behandling,
        hentSaksbehandlingssteger,
        Arr.findLast((v: Vilkårsinformasjon) => v.erStartet),
        Option.fold(
            () => Vilkårtype.Virkningstidspunkt,
            (x) => x.vilkårtype
        )
    );
};
