import apiClient, { ApiClientResult } from './apiClient';
import { Behandling } from './behandlingApi';
import { SøknadInnhold } from './søknadApi';

export interface Sak {
    id: string;
    fnr: string;
    behandlinger: Behandling[];
    søknader: Array<{ id: string; søknadInnhold: SøknadInnhold }>;
}

export async function fetchSakByFnr(fnr: string): Promise<ApiClientResult<Sak>> {
    return apiClient({ url: `/saker?fnr=${fnr}`, method: 'GET' });
}

export async function fetchSakBySakId(sakId: string): Promise<ApiClientResult<Sak>> {
    return apiClient({ url: `/saker/${sakId}`, method: 'GET' });
}
