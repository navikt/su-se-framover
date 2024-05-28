import { FrioppslagSkattRequest } from '~src/types/skatt/Skatt';

import apiClient, { ApiClientResult } from './apiClient';

export async function fetchSkattPdfOgJournalfør(arg: FrioppslagSkattRequest): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/skatt`,
        method: 'POST',
        body: {
            fnr: arg.fnr,
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

export async function fetchSkattPdfOgJournalførUtenVerifisering(
    arg: FrioppslagSkattRequest,
): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/skatt/uten-verifisering`,
        method: 'POST',
        body: {
            fnr: arg.fnr,
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
        url: `/skatt/forhandsvis`,
        method: 'POST',
        body: {
            fnr: arg.fnr,
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
