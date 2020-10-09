import { SøknadInnhold } from '~types/Søknad';

import apiClient, { ApiClientResult } from './apiClient';

export async function sendSøknad(søknad: SøknadInnhold): Promise<ApiClientResult<SøknadInnhold>> {
    return apiClient({ url: '/soknad', method: 'POST', body: søknad });
}

export async function trekkSøknad(arg: {
    sakId: string;
    søknadId: string;
    søknadTrukket: boolean;
}): Promise<ApiClientResult<string>> {
    return apiClient({
        url: `/soknad/${arg.søknadId}/trekkSoknad`,
        method: 'POST',
        body: {
            sakId: arg.sakId,
            søknadId: arg.søknadId,
            søknadTrukket: arg.søknadTrukket,
        },
    });
}
