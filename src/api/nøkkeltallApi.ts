import { Nøkkeltall } from '~types/Nøkkeltall';

import apiClient, { ApiClientResult } from './apiClient';

export async function hentNøkkeltall(): Promise<ApiClientResult<Nøkkeltall>> {
    return apiClient({
        url: `/nøkkeltall`,
        method: 'GET',
    });
}
