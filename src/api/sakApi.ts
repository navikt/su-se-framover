import { Sak } from '~types/Sak';

import apiClient, { ApiClientResult } from './apiClient';

export async function fetchSakByFnr(fnr: string): Promise<ApiClientResult<Sak>> {
    return apiClient({ url: `/saker?fnr=${fnr}`, method: 'GET' });
}

export async function fetchSakBySakId(sakId: string): Promise<ApiClientResult<Sak>> {
    return apiClient({ url: `/saker/${sakId}`, method: 'GET' });
}
