import {
    BrevtekstTilbakekrevingsbehandlingRequest,
    ForhåndsvarsleTilbakekrevingRequest,
    ForhåndsvisBrevtekstTilbakekrevingsbehandlingRequest,
    ManuellTilbakekrevingsbehandling,
    OpprettNyTilbakekrevingsbehandlingRequest,
    VurderTilbakekrevingsbehandlingRequest,
} from '~src/types/ManuellTilbakekrevingsbehandling';

import apiClient, { ApiClientResult } from './apiClient';

export async function opprettNyTilbakekrevingsbehandling(
    arg: OpprettNyTilbakekrevingsbehandlingRequest,
): Promise<ApiClientResult<ManuellTilbakekrevingsbehandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/tilbakekreving/ny`,
        method: 'POST',
        body: {
            versjon: arg.versjon,
        },
    });
}

export async function vurderTilbakekrevingsbehandling(
    arg: VurderTilbakekrevingsbehandlingRequest,
): Promise<ApiClientResult<ManuellTilbakekrevingsbehandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/tilbakekreving/${arg.behandlingId}/vurder`,
        method: 'POST',
        body: {
            versjon: arg.versjon,
            måneder: arg.måneder,
        },
    });
}

export async function forhåndsvisForhåndsvarsel(
    arg: ForhåndsvisBrevtekstTilbakekrevingsbehandlingRequest,
): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/saker/${arg.sakId}/tilbakekreving/${arg.behandlingId}/forhandsvarsel/forhandsvis`,
        method: 'POST',
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        body: {
            versjon: arg.saksversjon,
            fritekst: arg.brevtekst,
        },
        bodyTransformer: (res) => res.blob(),
    });
}

export async function sendForhåndsvarsel(
    arg: ForhåndsvarsleTilbakekrevingRequest,
): Promise<ApiClientResult<ManuellTilbakekrevingsbehandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/tilbakekreving/${arg.behandlingId}/forhandsvarsel`,
        method: 'POST',
        body: {
            versjon: arg.saksversjon,
            fritekst: arg.fritekst,
        },
    });
}

export async function brevtekstTilbakekrevingsbehandling(
    arg: BrevtekstTilbakekrevingsbehandlingRequest,
): Promise<ApiClientResult<ManuellTilbakekrevingsbehandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/tilbakekreving/${arg.behandlingId}/brevtekst`,
        method: 'POST',
        body: {
            versjon: arg.saksversjon,
            brevtekst: arg.brevtekst,
        },
    });
}
