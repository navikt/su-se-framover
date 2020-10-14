import { Sak } from '~types/Sak';
import { SøknadInnhold } from '~types/Søknad';

import apiClient, { ApiClientResult } from './apiClient';

export async function sendSøknad(søknad: SøknadInnhold): Promise<ApiClientResult<SøknadInnhold>> {
    return apiClient({ url: '/soknad', method: 'POST', body: søknad });
}

export async function lukkSøknad(arg: {
    sakId: string;
    søknadId: string;
    navIdent: string;
}): Promise<ApiClientResult<Sak>> {
    return apiClient({
        url: `/soknad/${arg.søknadId}/trekk`,
        method: 'POST',
        body: {
            navIdent: arg.navIdent,
        },
    });
}
