import { Sak } from '~types/Sak';
import { LukkSøknadType, SøknadInnhold } from '~types/Søknad';

import apiClient, { ApiClientResult } from './apiClient';

export async function sendSøknad(søknad: SøknadInnhold): Promise<ApiClientResult<SøknadInnhold>> {
    return apiClient({ url: '/soknad', method: 'POST', body: søknad });
}

export async function lukkSøknad(arg: {
    søknadId: string;
    lukketSøknadType: LukkSøknadType;
    datoSøkerTrakkSøknad: Date;
}): Promise<ApiClientResult<Sak>> {
    return apiClient({
        url: `/soknad/${arg.søknadId}/lukk`,
        method: 'POST',
        body: {
            typeLukking: arg.lukketSøknadType,
            datoSøkerTrakkSøknad: arg.datoSøkerTrakkSøknad,
        },
    });
}

export async function hentLukketSøknadsBrevutkast(arg: {
    søknadId: string;
    lukketSøknadType: LukkSøknadType;
    datoSøkerTrakkSøknad: Date;
}): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/soknad/${arg.søknadId}/lukk/brevutkast`,
        method: 'POST',
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        body: {
            typeLukking: arg.lukketSøknadType,
            datoSøkerTrakkSøknad: arg.datoSøkerTrakkSøknad,
        },
        bodyTransformer: (res) => res.blob(),
    });
}
