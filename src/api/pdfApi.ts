import { Nullable } from '~src/lib/types';

import apiClient, { ApiClientResult } from './apiClient';
import { AvslagManglendeDokType } from './søknadApi';

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

export async function fetchBrevutkastForSøknadsbehandlingWithFritekst(args: {
    sakId: string;
    behandlingId: string;
    fritekst: string;
}): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/saker/${args.sakId}/behandlinger/${args.behandlingId}/vedtaksutkast`,
        method: 'POST',
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        body: { fritekst: args.fritekst },
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

export async function fetchBrevutkastForRevurderingMedPotensieltFritekst(args: {
    sakId: string;
    revurderingId: string;
    fritekst: Nullable<string>;
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

export async function fetchBrevutkastForAvslutningAvRevurdering(args: {
    sakId: string;
    revurderingId: string;
    fritekst: Nullable<string>;
}): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/saker/${args.sakId}/revurderinger/${args.revurderingId}/brevutkastForAvslutting`,
        method: 'POST',
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        body: {
            fritekst: args.fritekst,
        },
        bodyTransformer: (res) => res.blob(),
    });
}

export async function hentBrevutkastForKlage(arg: { sakId: string; klageId: string }): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/saker/${arg.sakId}/klager/${arg.klageId}/brevutkast`,
        method: 'POST',
        bodyTransformer: (res) => res.blob(),
    });
}

export async function brevutkastForAvslagPgaManglendeDokumentasjon(arg: {
    søknadId: string;
    body: AvslagManglendeDokType;
}): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/soknad/${arg.søknadId}/avslag/brevutkast`,
        method: 'POST',
        body: arg.body,
        bodyTransformer: (res) => res.blob(),
    });
}
