import {
    Notat,
    NotatMedVedlegg,
    NotatResponse,
    OpprettNotatBody,
    OpprettNotatResponse,
    ReferanseType,
} from '~src/types/Notat';
import apiClient, { ApiClientResult, ErrorCode } from './apiClient';

export interface HentNotatForReferanseRequest {
    sakId: string;
    referanseId: string;
    referanseType: ReferanseType;
}

export interface OppdaterNotatRequest {
    sakId: string;
    notatId: string;
    notat: string;
}

export interface LeggTilVedleggRequest {
    sakId: string;
    notatId: string;
    filnavn: string;
    fil: File;
}

export interface SlettVedleggRequest {
    sakId: string;
    notatId: string;
    vedleggId: string;
}

export async function hentAlleNotater(sakId: string): Promise<ApiClientResult<Notat[]>> {
    return apiClient({
        url: `/notat/${sakId}`,
        method: 'GET',
    });
}

export async function opprettNotat(
    sakId: string,
    body: OpprettNotatBody,
): Promise<ApiClientResult<OpprettNotatResponse>> {
    return apiClient({
        url: `/notat/${sakId}`,
        method: 'POST',
        body,
    });
}

export async function hentNotat(request: HentNotatForReferanseRequest): Promise<ApiClientResult<NotatResponse | null>> {
    const res = await apiClient<NotatResponse>({
        url: `/notat/${request.sakId}/${request.referanseId}/hentNotat?referanseType=${request.referanseType}`,
        method: 'GET',
    });

    if (res.status === 'error' && res.error.statusCode === ErrorCode.NotFound) {
        return {
            status: 'ok',
            data: null,
            statusCode: res.error.statusCode,
        };
    }

    return res as ApiClientResult<NotatResponse | null>;
}

export async function hentNotatMedVedlegg(sakId: string, notatId: string): Promise<ApiClientResult<NotatMedVedlegg>> {
    return apiClient({
        url: `/notat/${sakId}/${notatId}`,
        method: 'GET',
    });
}

export async function oppdaterNotatSomSaksbehandler(request: OppdaterNotatRequest): Promise<ApiClientResult<void>> {
    return apiClient({
        url: `/notat/${request.sakId}/${request.notatId}/saksbehandler`,
        method: 'POST',
        body: {
            notat: request.notat,
        },
    });
}

export async function oppdaterNotatSomAttestant(request: OppdaterNotatRequest): Promise<ApiClientResult<void>> {
    return apiClient({
        url: `/notat/${request.sakId}/${request.notatId}/attestant`,
        method: 'POST',
        body: {
            notat: request.notat,
        },
    });
}

export async function leggTilVedlegg(request: LeggTilVedleggRequest): Promise<ApiClientResult<void>> {
    const formData = new FormData();
    formData.append('filnavn', request.filnavn);
    formData.append('fil', request.fil);

    return apiClient({
        url: `/notat/${request.sakId}/${request.notatId}/vedlegg`,
        method: 'POST',
        body: formData,
    });
}

export async function slettVedlegg(request: SlettVedleggRequest): Promise<ApiClientResult<void>> {
    return apiClient({
        url: `/notat/${request.sakId}/${request.notatId}/vedlegg/${request.vedleggId}`,
        method: 'DELETE',
    });
}
