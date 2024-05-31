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

export const opprettNyKontrollsamtale = (arg: { sakId: string; dato: string }) =>
    apiClient<Kontrollsamtale>({
        url: `/saker/${arg.sakId}/kontrollsamtaler`,
        method: 'POST',
    });

export const oppdaterKontrollsamtaleStatusOgJournalpost = (arg: OppdaterKontrollsamtaleStatusOgJournalpostRequest) =>
    apiClient<Kontrollsamtale>({
        url: `/saker/${arg.sakId}/kontrollsamtaler`,
        method: 'POST',
        body: {
            status: arg.status,
            journalpostId: arg.journalpostId,
        },
    });

export const oppdaterKontrollsamtaleInnkallingsdato = (arg: OppdaterKontrollsamtaleInnkallingsdatoRequest) =>
    apiClient<Kontrollsamtale>({
        url: `/saker/${arg.sakId}/kontrollsamtaler`,
        method: 'POST',
        body: {
            innkallingsdato: arg.innkallingsmåned,
        },
    });

export const annullerKontrollsamtale = (arg: AnnullerKontrollsamtaleRequest) =>
    apiClient<{ status: 'OK' }>({
        url: `/saker/${arg.sakId}/kontrollsamtaler/${arg.kontrollsamtaleId}`,
        method: 'DELETE',
    });
