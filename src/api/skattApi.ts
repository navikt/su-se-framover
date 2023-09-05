import { FrioppslagSkattRequest } from '~src/types/skatt/Skatt';

import apiClient, { ApiClientResult } from './apiClient';

export async function fetchSkattFor(arg: FrioppslagSkattRequest): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/skatt/person/${arg.fnr}`,
        method: 'POST',
        body: {
            år: arg.år,
            begrunnelse: arg.begrunnelse,
            sakstype: arg.sakstype,
            fagsystemId: arg.fagsystemId,
        },
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        bodyTransformer: (res) => res.blob(),
    });
}
