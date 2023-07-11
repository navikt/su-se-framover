import { Nullable } from '~src/lib/types';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';

import apiClient, { ApiClientResult } from './apiClient';
import { OpprettetSøknad } from './søknadApi';

export async function sendUføresøknad(fnr: Nullable<string>): Promise<ApiClientResult<OpprettetSøknad>> {
    return apiClient({
        url: '/soknad/dev/ny/uføre',
        method: 'POST',
        body: {
            fnr: fnr,
        },
    });
}

export async function sendIverksattSøknadsbehandling(
    fnr: Nullable<string>,
    resultat: 'avslag' | 'innvilget',
    stønadsperiode: {
        fraOgMed: string;
        tilOgMed: string;
    },
): Promise<ApiClientResult<Søknadsbehandling>> {
    return apiClient({
        url: '/søknadsbehandling/dev/ny/iverksatt',
        method: 'POST',
        body: {
            fnr: fnr,
            resultat: resultat,
            fraOgMed: stønadsperiode.fraOgMed,
            tilOgMed: stønadsperiode.tilOgMed,
        },
    });
}
