import { Nullable } from '~lib/types';
import { AvvistBrevConfig } from '~pages/saksbehandling/lukkSøknad/lukkSøknadUtils';
import { Sak } from '~types/Sak';
import { LukkSøknadBegrunnelse, SøknadInnhold } from '~types/Søknad';

import apiClient, { ApiClientResult } from './apiClient';

interface Trukket {
    type: LukkSøknadBegrunnelse.Trukket;
    datoSøkerTrakkSøknad: string;
}
interface Bortfalt {
    type: LukkSøknadBegrunnelse.Bortfalt;
}
interface Avvist {
    type: LukkSøknadBegrunnelse.Avvist;
    brevConfig: Nullable<AvvistBrevConfig>;
}

export type LukkSøknadBodyTypes = Trukket | Bortfalt | Avvist;

export async function sendSøknad(søknad: SøknadInnhold): Promise<ApiClientResult<SøknadInnhold>> {
    return apiClient({ url: '/soknad', method: 'POST', body: søknad });
}

export async function lukkSøknad(arg: { søknadId: string; body: LukkSøknadBodyTypes }): Promise<ApiClientResult<Sak>> {
    return apiClient({
        url: `/soknad/${arg.søknadId}/lukk`,
        method: 'POST',
        body: arg.body,
    });
}

export async function hentLukketSøknadsBrevutkast(arg: {
    søknadId: string;
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
