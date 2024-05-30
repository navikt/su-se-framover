import {
    AnnullerKontrollsamtaleRequest,
    Kontrollsamtale,
    OppdaterKontrollsamtaleRequest,
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

export const oppdaterKontrollsamtale = (arg: OppdaterKontrollsamtaleRequest) =>
    apiClient({
        url: `/saker/${arg.sakId}/kontrollsamtaler/${arg.kontrollsamtaleId}`,
        method: 'POST',
        body: { dato: arg.dato },
    });

export const annullerKontrollsamtale = (arg: AnnullerKontrollsamtaleRequest) =>
    apiClient<{ status: 'OK' }>({
        url: `/saker/${arg.sakId}/kontrollsamtaler/${arg.kontrollsamtaleId}`,
        method: 'DELETE',
    });
