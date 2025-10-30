import {
    AvsluttTilbakekrevingRequest,
    BrevtekstTilbakekrevingsbehandlingRequest,
    ForhåndsvarsleTilbakekrevingRequest,
    ForhåndsvisBrevtekstTilbakekrevingsbehandlingRequest,
    ForhåndsvisVedtaksbrevTilbakekrevingsbehandlingRequest,
    OppdaterKravgrunnlagTilbakekrevingRequest,
    IverksettTilbakekrevingRequest,
    ManuellTilbakekrevingsbehandling,
    OpprettNyTilbakekrevingsbehandlingRequest,
    SendTilbakekrevingTilAttesteringRequest,
    UnderkjennTilbakekrevingRequest,
    VisUtsendtForhåndsvarselTilbakekrevingsbehandlingRequest,
    VurderTilbakekrevingsbehandlingRequest,
    BehandlingsnotatTilbakekrevingRequest,
    AnnullerKravgunnlagTilbakekrevingRequest,
    AnnullerKravgrunnlagTilbakekrevingResponse,
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

export async function opprettNyTilbakekrevingsbehandlingUtenKravrunnlag(
    arg: OpprettNyTilbakekrevingsbehandlingRequest,
): Promise<ApiClientResult<ManuellTilbakekrevingsbehandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/tilbakekreving/uten_kravgrunnlag`,
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
            perioder: arg.perioder,
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

export async function visUtsendtForhåndsvarsel(
    arg: VisUtsendtForhåndsvarselTilbakekrevingsbehandlingRequest,
): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/saker/${arg.sakId}/tilbakekreving/${arg.behandlingId}/forhandsvarsel/${arg.dokumentId}`,
        method: 'GET',
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
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

export async function forhåndsvisVedtaksbrevTilbakekrevingsbehandling(
    arg: ForhåndsvisVedtaksbrevTilbakekrevingsbehandlingRequest,
): Promise<ApiClientResult<Blob>> {
    return apiClient({
        url: `/saker/${arg.sakId}/tilbakekreving/${arg.behandlingId}/vedtaksbrev/forhandsvis`,
        method: 'GET',
        bodyTransformer: (res) => res.blob(),
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

export async function sendTilbakekrevingTilAttestering(
    arg: SendTilbakekrevingTilAttesteringRequest,
): Promise<ApiClientResult<ManuellTilbakekrevingsbehandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/tilbakekreving/${arg.behandlingId}/tilAttestering`,
        method: 'POST',
        body: {
            versjon: arg.versjon,
        },
    });
}

export async function iverksettTilbakekreving(
    arg: IverksettTilbakekrevingRequest,
): Promise<ApiClientResult<ManuellTilbakekrevingsbehandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/tilbakekreving/${arg.behandlingId}/iverksett`,
        method: 'POST',
        body: {
            versjon: arg.versjon,
        },
    });
}

export async function underkjennTilbakekreving(
    arg: UnderkjennTilbakekrevingRequest,
): Promise<ApiClientResult<ManuellTilbakekrevingsbehandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/tilbakekreving/${arg.behandlingId}/underkjenn`,
        method: 'POST',
        body: {
            versjon: arg.versjon,
            kommentar: arg.kommentar,
            grunn: arg.grunn,
        },
    });
}

export async function avsluttTilbakekreving(
    arg: AvsluttTilbakekrevingRequest,
): Promise<ApiClientResult<ManuellTilbakekrevingsbehandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/tilbakekreving/${arg.behandlingId}/avbryt`,
        method: 'POST',
        body: {
            versjon: arg.versjon,
            begrunnelse: arg.begrunnelse,
        },
    });
}

export async function oppdaterKravgrunnlag(
    arg: OppdaterKravgrunnlagTilbakekrevingRequest,
): Promise<ApiClientResult<ManuellTilbakekrevingsbehandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/tilbakekreving/${arg.behandlingId}/oppdaterKravgrunnlag`,
        method: 'POST',
        body: {
            versjon: arg.versjon,
        },
    });
}

export async function behandlingsnotatTilbakekreving(
    arg: BehandlingsnotatTilbakekrevingRequest,
): Promise<ApiClientResult<ManuellTilbakekrevingsbehandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/tilbakekreving/${arg.behandlingId}/notat`,
        method: 'POST',
        body: {
            versjon: arg.versjon,
            notat: arg.notat,
        },
    });
}

export async function annullerKravgrunnlag(
    arg: AnnullerKravgunnlagTilbakekrevingRequest,
): Promise<ApiClientResult<AnnullerKravgrunnlagTilbakekrevingResponse>> {
    return apiClient({
        url: `/saker/${arg.sakId}/tilbakekreving/kravgrunnlag/${arg.kravgrunnlagHendelseId}/annuller`,
        method: 'PATCH',
        body: {
            versjon: arg.versjon,
        },
    });
}
