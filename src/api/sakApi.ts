import apiClient, { ApiClientResult } from './apiClient';

export interface Sak {
    id: string;
}

export async function fetchSak(fnr: string): Promise<ApiClientResult<Sak>> {
    return apiClient(`/person/${fnr}/sak`, {
        method: 'GET',
    });
}
