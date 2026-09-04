import {
    AnnullerKontrollsamtaleRequest,
    Kontrollsamtale,
    KontrollsamtaleNotatVedlegg,
    LagreKontrollsamtaleNotatRequest,
    LeggTilKontrollsamtaleVedleggRequest,
    OppdaterKontrollsamtaleInnkallingsdatoRequest,
    OppdaterKontrollsamtaleStatusOgJournalpostRequest,
} from '~src/types/Kontrollsamtale';

import apiClient, { ApiClientResult } from './apiClient';

export const hentKontrollsamtaler = (arg: { sakId: string }) =>
    apiClient<Kontrollsamtale[]>({
        url: `/saker/${arg.sakId}/kontrollsamtaler`,
        method: 'GET',
    });

export const opprettNyKontrollsamtale = (arg: { sakId: string; innkallingsmåned: string }) =>
    apiClient<Kontrollsamtale>({
        url: `/saker/${arg.sakId}/kontrollsamtaler`,
        method: 'POST',
        body: {
            innkallingsmåned: arg.innkallingsmåned,
        },
    });

export const oppdaterKontrollsamtaleStatusOgJournalpost = (arg: OppdaterKontrollsamtaleStatusOgJournalpostRequest) =>
    apiClient<Kontrollsamtale>({
        url: `/saker/${arg.sakId}/kontrollsamtaler/${arg.kontrollsamtaleId}/status`,
        method: 'PATCH',
        body: {
            status: arg.status,
            journalpostId: arg.journalpostId,
        },
    });

export const oppdaterKontrollsamtaleInnkallingsdato = (arg: OppdaterKontrollsamtaleInnkallingsdatoRequest) =>
    apiClient<Kontrollsamtale>({
        url: `/saker/${arg.sakId}/kontrollsamtaler/${arg.kontrollsamtaleId}/innkallingsmåned`,
        method: 'PATCH',
        body: {
            innkallingsmåned: arg.innkallingsmåned,
        },
    });

export const annullerKontrollsamtale = (arg: AnnullerKontrollsamtaleRequest) =>
    apiClient<Kontrollsamtale>({
        url: `/saker/${arg.sakId}/kontrollsamtaler/${arg.kontrollsamtaleId}`,
        method: 'DELETE',
    });

export const lagreKontrollsamtaleNotat = (arg: LagreKontrollsamtaleNotatRequest) => {
    const { sakId, kontrollsamtaleId, ...body } = arg;
    const formData = new FormData();
    formData.append('body', JSON.stringify(body));
    return apiClient({
        url: `/saker/${sakId}/kontrollsamtaler/notat/${kontrollsamtaleId}`,
        method: 'POST',
        body: formData,
    });
};

export const leggTilKontrollsamtaleVedlegg = (
    arg: LeggTilKontrollsamtaleVedleggRequest,
): Promise<ApiClientResult<void>> => {
    const formData = new FormData();
    formData.append('filnavn', arg.fil.name);
    formData.append('fil', arg.fil);

    return apiClient({
        url: `/saker/${arg.sakId}/kontrollsamtaler/notat/${arg.kontrollsamtaleId}/vedlegg`,
        method: 'POST',
        body: formData,
    });
};

export const hentKontrollsamtaleVedlegg = (arg: {
    sakId: string;
    kontrollsamtaleId: string;
}): Promise<ApiClientResult<KontrollsamtaleNotatVedlegg[]>> =>
    apiClient({
        url: `/saker/${arg.sakId}/kontrollsamtaler/notat/${arg.kontrollsamtaleId}/vedlegg`,
        method: 'GET',
    });

export const slettKontrollsamtaleVedlegg = (arg: { sakId: string; kontrollsamtaleId: string; vedleggId: string }) =>
    apiClient({
        url: `/saker/${arg.sakId}/kontrollsamtaler/notat/${arg.kontrollsamtaleId}/vedlegg/${arg.vedleggId}`,
        method: 'DELETE',
    });
