import apiClient, { ApiClientResult } from './apiClient';

export async function fetchBrev(sakId: string, behandlingId: string): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/saker/${sakId}/behandlinger/${behandlingId}/vedtaksutkast`,
        method: 'GET',
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        bodyTransformer: (res) => res.blob(),
    });
}

export async function fetchSøknad(søknadId: string): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/soknad/${søknadId}/utskrift`,
        method: 'GET',
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        bodyTransformer: (res) => res.blob(),
    });
}

export async function fetchRevurderingsVedtak(sakId: string): Promise<ApiClientResult<Blob>> {
    return {
        status: 'error',
        error: {
            statusCode: 9001,
            correlationId: sakId,
            body: {
                message: 'brev er ikke åpen for testing',
            },
        },
    };

    /*
    return apiClient({
        url: `/saker/${sakId}/behandlinger/${behandlingId}/vedtaksutkast`,
        method: 'GET',
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        bodyTransformer: (res) => res.blob(),
    });
    */
}
