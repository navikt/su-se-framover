import apiClient, { ApiClientResult } from './apiClient';
import { Søknad } from './søknadApi';
import { Behandling } from './behandlingApi';

export interface Sak {
    id: number;
    fnr: string;
    stønadsperioder: Array<{ id: number; søknad: { id: number; json: Søknad }; behandlinger: Behandling[] }>;
}

export async function fetchSak(fnr: string): Promise<ApiClientResult<Sak>> {
    return apiClient(`/person/${fnr}/sak`, {
        method: 'GET',
    });
}
