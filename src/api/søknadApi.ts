import { AvvistBrevConfig } from '~pages/saksbehandling/lukkSøknad/lukkSøknadUtils';
import { Sak } from '~types/Sak';
import { LukkSøknadType, SøknadInnhold } from '~types/Søknad';

import apiClient, { ApiClientResult } from './apiClient';

export type LukkSøknadBodyTypes = Record<string, string | AvvistBrevConfig | null>;

export async function sendSøknad(søknad: SøknadInnhold): Promise<ApiClientResult<SøknadInnhold>> {
    return apiClient({ url: '/soknad', method: 'POST', body: søknad });
}

export async function lukkSøknad(arg: {
    søknadId: string;
    lukketSøknadType: LukkSøknadType;
    body: LukkSøknadBodyTypes;
}): Promise<ApiClientResult<Sak>> {
    return apiClient({
        url: `/soknad/${arg.søknadId}/lukk`,
        method: 'POST',
        body: arg.body,
    });
}

export async function hentLukketSøknadsBrevutkast(arg: {
    søknadId: string;
    lukketSøknadType: LukkSøknadType;
    body: LukkSøknadBodyTypes;
}): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/soknad/${arg.søknadId}/lukk/brevutkast`,
        method: 'POST',
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        body: arg.body,
        bodyTransformer: (res) => res.blob(),
    });
}
