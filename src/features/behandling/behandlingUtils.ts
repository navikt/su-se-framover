import { Behandling, Behandlingsstatus } from '~types/Behandling';
import { Sak } from '~types/Sak';

export const findBehandling = (sak: Sak, behandlingId: string) => {
    return sak.behandlinger.find((b) => b.id === behandlingId);
};

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
