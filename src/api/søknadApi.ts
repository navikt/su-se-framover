import { Sak } from '~types/Sak';
import { LukkSøknadType, SøknadInnhold } from '~types/Søknad';

import apiClient, { ApiClientResult } from './apiClient';

export async function sendSøknad(søknad: SøknadInnhold): Promise<ApiClientResult<SøknadInnhold>> {
    return apiClient({ url: '/soknad', method: 'POST', body: søknad });
}

export async function lukkSøknad(arg: {
    søknadId: string;
    lukketSøknadType: LukkSøknadType;
    body: Record<string, string>;
}): Promise<ApiClientResult<Sak>> {
    return apiClient({
        url: `/soknad/${arg.søknadId}/lukk?type=${arg.lukketSøknadType}`,
        method: 'POST',
        body: arg.body,
    });
}

export async function hentLukketSøknadsBrevutkast(arg: {
    søknadId: string;
    lukketSøknadType: LukkSøknadType;
    body: Record<string, string>;
}): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/soknad/${arg.søknadId}/lukk/brevutkast?type=${arg.lukketSøknadType}`,
        method: 'POST',
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        body: arg.body,
        bodyTransformer: (res) => res.blob(),
    });
}
