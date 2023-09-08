import { FrioppslagSkattRequest } from '~src/types/skatt/Skatt';

import apiClient, { ApiClientResult } from './apiClient';

export async function fetchSkattPdfOgJournalfør(arg: FrioppslagSkattRequest): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/skatt/person/${arg.fnr}`,
        method: 'POST',
        body: {
            epsFnr: arg.epsFnr,
            år: arg.år,
            begrunnelse: arg.begrunnelse,
            sakstype: arg.sakstype,
            fagsystemId: arg.fagsystemId,
        },
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        bodyTransformer: (res) => res.blob(),
    });
}
export async function fetchSkattForForhåndsvisning(arg: FrioppslagSkattRequest): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/skatt/person/${arg.fnr}/forhandsvis`,
        method: 'POST',
        body: {
            epsFnr: arg.epsFnr,
            år: arg.år,
            begrunnelse: arg.begrunnelse,
            sakstype: arg.sakstype,
            fagsystemId: arg.fagsystemId,
        },
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        bodyTransformer: (res) => res.blob(),
    });
}
