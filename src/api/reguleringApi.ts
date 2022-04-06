import { Regulering } from '~src/types/Regulering';

import apiClient, { ApiClientResult } from './apiClient';

export async function startRegulering({ startDato }: { startDato: string }) {
    return apiClient({
        url: `/reguleringer/automatisk`,
        method: 'POST',
        body: {
            startDato,
        },
    });
}

export async function hentReguleringsstatus(): Promise<ApiClientResult<Regulering[]>> {
    return apiClient({
        url: `/reguleringer/status`,
        method: 'GET',
    });
}

export async function hentSakerMedÅpneBehandlinger(): Promise<ApiClientResult<number[]>> {
    return apiClient({
        url: `/reguleringer/saker/apneBehandlinger`,
        method: 'GET',
    });
}
