import { formatISO } from 'date-fns';

import { Behandling, Behandlingsstatus } from '~types/Behandling';
import { Behandlingsinformasjon } from '~types/Behandlingsinformasjon';
import { Fradrag } from '~types/Fradrag';
import { Sats } from '~types/Sats';
import { Vilkårtype, VilkårVurderingStatus } from '~types/Vilkårsvurdering';

import apiClient, { ApiClientResult } from './apiClient';

export function tilAttestering(behandling: Behandling): boolean {
    return (
        [Behandlingsstatus.TIL_ATTESTERING_AVSLAG, Behandlingsstatus.TIL_ATTESTERING_INNVILGET].find(
            (x) => behandling.status === x
        ) !== undefined
    );
}

export function iverksatt(behandling: Behandling): boolean {
    return (
        [Behandlingsstatus.IVERKSATT_AVSLAG, Behandlingsstatus.IVERKSATT_INNVILGET].find(
            (x) => behandling.status === x
        ) !== undefined
    );
}

export function avslag(behandling: Behandling): boolean {
    return Boolean(
        [Behandlingsstatus.TIL_ATTESTERING_AVSLAG, Behandlingsstatus.VILKÅRSVURDERT_AVSLAG].find(
            (status) => behandling.status === status
        )
    );
}

export async function startBehandling(arg: { sakId: string; søknadId: string }): Promise<ApiClientResult<Behandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/behandlinger`,
        method: 'POST',
        body: {
            soknadId: arg.søknadId,
        },
    });
}

export async function hentBehandling(sakId: string, behandlingId: string): Promise<ApiClientResult<Behandling>> {
    return apiClient({
        url: `/saker/${sakId}/behandlinger/${behandlingId}`,
        method: 'GET',
    });
}

export async function startBeregning(
    sakId: string,
    behandlingId: string,
    arg: {
        sats: Sats;
        fom: Date;
        tom: Date;
        fradrag: Fradrag[];
    }
): Promise<ApiClientResult<Behandling>> {
    const { sats, fom, tom } = arg;
    return apiClient({
        url: `/saker/${sakId}/behandlinger/${behandlingId}/beregn`,
        method: 'POST',
        body: {
            sats,
            fom: formatISO(fom, { representation: 'date' }),
            tom: formatISO(tom, { representation: 'date' }),
            fradrag: arg.fradrag,
        },
    });
}

export async function lagreVilkårsvurdering(arg: {
    sakId: string;
    behandlingId: string;
    vilkårsvurderingId: string;
    vilkårtype: Vilkårtype;
    status: VilkårVurderingStatus;
    begrunnelse: string;
}) {
    return apiClient<Behandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/vilkarsvurderinger`,
        method: 'PATCH',
        body: {
            [arg.vilkårtype]: {
                id: arg.vilkårsvurderingId,
                begrunnelse: arg.begrunnelse,
                status: arg.status,
            },
        },
    });
}

export async function lagreBehandlingsinformasjon(arg: {
    sakId: string;
    behandlingId: string;
    behandlingsinformasjon: Partial<Behandlingsinformasjon>;
}) {
    return apiClient<Behandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/informasjon`,
        method: 'PATCH',
        body: arg.behandlingsinformasjon,
    });
}

// Denne vil kanskje på sikt låse behandlingen også.
export async function simulerBehandling(sakId: string, behandlingId: string): Promise<ApiClientResult<Behandling>> {
    return apiClient({
        url: `/saker/${sakId}/behandlinger/${behandlingId}/simuler`,
        method: 'POST',
    });
}

export async function sendTilAttestering(arg: {
    sakId: string;
    behandlingId: string;
}): Promise<ApiClientResult<Behandling>> {
    return apiClient<Behandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/tilAttestering`,
        method: 'POST',
    });
}

export async function iverksett(arg: { sakId: string; behandlingId: string }) {
    return apiClient<Behandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/iverksett`,
        method: 'PATCH',
    });
}
