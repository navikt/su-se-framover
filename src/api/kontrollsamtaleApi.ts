import {
    AnnullerKontrollsamtaleRequest,
    Kontrollsamtale,
    OppdaterKontrollsamtaleInnkallingsdatoRequest,
    OppdaterKontrollsamtaleStatusOgJournalpostRequest,
} from '~src/types/Kontrollsamtale';

import apiClient from './apiClient';

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
