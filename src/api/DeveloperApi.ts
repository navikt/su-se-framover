import { Nullable } from '~src/lib/types';

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
