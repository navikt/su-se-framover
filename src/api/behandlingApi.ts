import apiClient, { ApiClientResult } from './apiClient';

export enum VilkårVurderingStatus {
    IkkeVurdert = 'IKKE_VURDERT',
    Ok = 'OK',
    IkkeOk = 'IKKE_OK',
}

export interface Behandling {
    id: string;
    vilkårsvurderinger: Array<{ id: string; vilkår: string; begrunnelse: string; status: VilkårVurderingStatus }>;
}

export async function startBehandling(sakId: string, stønadsperiodeId: string): Promise<ApiClientResult<Behandling>> {
    return apiClient(`/sak/${sakId}/stonadsperioder/${stønadsperiodeId}/behandlinger`, {
        method: 'POST',
    });
}
