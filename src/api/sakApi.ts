import { Sak, ÅpenBehandling } from '~types/Sak';

import apiClient, { ApiClientResult } from './apiClient';

export async function fetchSakByFnr(fnr: string): Promise<ApiClientResult<Sak>> {
    return apiClient({
        url: `/saker/søk`,
        method: 'POST',
        body: {
            fnr: fnr,
        },
    });
}

export async function fetchSakBySaksnummer(saksnummer: string): Promise<ApiClientResult<Sak>> {
    return apiClient({
        url: `/saker/søk`,
        method: 'POST',
        body: {
            saksnummer: saksnummer,
        },
    });
}

export async function fetchSakBySakId(sakId: string): Promise<ApiClientResult<Sak>> {
    return apiClient({ url: `/saker/${sakId}`, method: 'GET' });
}

export async function hentÅpneBehandlingerForAlleSaker(): Promise<ApiClientResult<ÅpenBehandling[]>> {
    return apiClient({ url: `/saker/restanser`, method: 'GET' });
}
