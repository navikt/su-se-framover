import { findLast } from 'fp-ts/lib/Array';
import { pipe } from 'fp-ts/lib/function';
import { isNone } from 'fp-ts/lib/Option';

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

export const hentSisteVurderteVilkår = (behandlingsinformasjon: Behandlingsinformasjon) => {
    const vilkår = mapToVilkårsinformasjon(behandlingsinformasjon);
    const lastElement = pipe(
        vilkår,
        findLast((v: Vilkårsinformasjon) => v.erStartet)
    );

    if (isNone(lastElement)) {
        return Vilkårtype.Uførhet;
    }
    console.log(lastElement);
    return lastElement.value.vilkårtype;
};
