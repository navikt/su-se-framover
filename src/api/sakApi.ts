import apiClient, { ApiClientResult } from './apiClient';
import { SøknadInnhold } from './søknadApi';
import { Behandling } from './behandlingApi';

export interface Sak {
    id: string;
    fnr: string;
    behandlinger: Behandling[];
    søknader: Array<{ id: string; søknadInnhold: SøknadInnhold }>;
}

export async function fetchSak(fnr: string): Promise<ApiClientResult<Sak>> {
    return apiClient({ url: `/saker?fnr=${fnr}`, method: 'GET' });
}
