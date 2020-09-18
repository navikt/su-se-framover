import { Behandling, Behandlingsstatus } from '~types/Behandling';

export function tilAttestering(behandling: Behandling): boolean {
    return Boolean(
        [Behandlingsstatus.TIL_ATTESTERING_AVSLAG, Behandlingsstatus.TIL_ATTESTERING_INNVILGET].find(
            (status) => behandling.status === status
        )
    );
}

export function iverksatt(behandling: Behandling): boolean {
    return Boolean(
        [Behandlingsstatus.IVERKSATT_AVSLAG, Behandlingsstatus.IVERKSATT_INNVILGET].find(
            (status) => behandling.status === status
        )
    );
}

export function avslag(behandling: Behandling): boolean {
    return Boolean(
        [Behandlingsstatus.TIL_ATTESTERING_AVSLAG, Behandlingsstatus.VILKÅRSVURDERT_AVSLAG].find(
            (status) => behandling.status === status
        )
    );
}
