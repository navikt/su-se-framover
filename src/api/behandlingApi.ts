import apiClient, { ApiClientResult } from './apiClient';

export interface Behandling {
    id: string;
    vilkårsvurderinger: Array<{ id: string; vilkår: string; begrunnelse: string; status: string }>;
}

export async function startBehandling(sakId: string, stønadsperiodeId: string): Promise<ApiClientResult<Behandling>> {
    return apiClient(`/sak/${sakId}/stonadsperioder/${stønadsperiodeId}/behandlinger`, {
        method: 'POST',
    });
}
