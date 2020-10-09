import * as Array from 'fp-ts/Array';
import { pipe } from 'fp-ts/lib/function';
import * as Option from 'fp-ts/Option';

import { mapToVilkårsinformasjon, Vilkårsinformasjon } from '~features/saksoversikt/utils';
import { Behandling, Behandlingsstatus } from '~types/Behandling';
import { Behandlingsinformasjon } from '~types/Behandlingsinformasjon';
import { Sak } from '~types/Sak';
import { Vilkårtype } from '~types/Vilkårsvurdering';

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
    ].some((status) => behandling.status === status);
}

export function harBeregning(behandling: Behandling): boolean {
    return [Behandlingsstatus.BEREGNET_AVSLAG, Behandlingsstatus.BEREGNET_INVILGET, Behandlingsstatus.SIMULERT].some(
        (status) => behandling.status === status
    );
}

export const hentSisteVurderteVilkår = (behandlingsinformasjon: Behandlingsinformasjon) => {
    return pipe(
        behandlingsinformasjon,
        mapToVilkårsinformasjon,
        Array.findLast((v: Vilkårsinformasjon) => v.erStartet),
        Option.fold(
            () => Vilkårtype.Uførhet,
            (x) => x.vilkårtype
        )
    );
};
