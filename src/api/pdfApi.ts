import apiClient, { ApiClientResult } from './apiClient';

export async function fetchBrevutkastForSøknadsbehandling(args: {
    sakId: string;
    behandlingId: string;
}): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/saker/${args.sakId}/behandlinger/${args.behandlingId}/vedtaksutkast`,
        method: 'GET',
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        bodyTransformer: (res) => res.blob(),
    });
}

export async function fetchBrevutkastForSøknadsbehandlingWithFritekst(
    sakId: string,
    behandlingId: string,
    fritekst: string
): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/saker/${sakId}/behandlinger/${behandlingId}/vedtaksutkast`,
        method: 'POST',
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        body: { fritekst: fritekst },
        bodyTransformer: (res) => res.blob(),
    });
}

export async function fetchSøknadutskrift(søknadId: string): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/soknad/${søknadId}/utskrift`,
        method: 'GET',
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        bodyTransformer: (res) => res.blob(),
    });
}

export async function fetchBrevutkastForRevurdering(
    sakId: string,
    revurderingId: string
): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/brevutkast`,
        method: 'GET',
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        bodyTransformer: (res) => res.blob(),
    });
}

export async function fetchBrevutkastForRevurderingWithFritekst(args: {
    sakId: string;
    revurderingId: string;
    fritekst: string;
}): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/saker/${args.sakId}/revurderinger/${args.revurderingId}/brevutkast`,
        method: 'POST',
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        body: {
            fritekst: args.fritekst,
        },
        bodyTransformer: (res) => res.blob(),
    });
}

export async function fetchBrevutkastForForhåndsvarsel(
    sakId: string,
    revurderingId: string,
    fritekst: string
): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/brevutkastForForhandsvarsel`,
        method: 'POST',
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        body: {
            fritekst,
        },
        bodyTransformer: (res) => res.blob(),
    });
}
