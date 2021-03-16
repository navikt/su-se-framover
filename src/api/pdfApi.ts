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

export async function fetchBrevutkast(sakId: string, revurderingId: string): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/brevutkast`,
        method: 'GET',
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        bodyTransformer: (res) => res.blob(),
    });
}

export async function fetchBrevutkastWithFritekst(
    sakId: string,
    revurderingId: string,
    fritekst: string
): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/brevutkast`,
        method: 'POST',
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        body: {
            fritekst,
        },
        bodyTransformer: (res) => res.blob(),
    });
}
