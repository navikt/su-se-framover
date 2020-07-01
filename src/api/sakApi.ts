import apiClient, { ApiClientResult } from './apiClient';
import { Søknad } from './søknadApi';

export interface Sak {
    id: string;
    fnr: string;
    stønadsperioder: Array<{ id: string; søknad: { id: number; json: Søknad } }>;
}

export async function fetchSak(fnr: string): Promise<ApiClientResult<Sak>> {
    return apiClient(`/person/${fnr}/sak`, {
        method: 'GET',
    });
}
