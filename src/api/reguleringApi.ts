import { Regulering } from '~types/Regulering';

import apiClient, { ApiClientResult } from './apiClient';

export async function testRegulering() {
    return apiClient({
        url: `/reguleringer/automatisk`,
        method: 'POST',
    });
}

export async function hentReguleringsstatus(): Promise<ApiClientResult<Regulering[]>> {
    const jobbnavn = 'G_REGULERING_2022';
    return apiClient({
        url: `/reguleringer/status/${jobbnavn}`,
        method: 'GET',
    });
}

export async function hentSakerMedÅpneBehandlinger(): Promise<ApiClientResult<number[]>> {
    return apiClient({
        url: `/reguleringer/saker/apneBehandlinger`,
        method: 'GET',
    });
}
