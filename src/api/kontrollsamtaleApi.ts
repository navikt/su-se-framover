import { Kontrollsamtale } from '~types/Kontrollsamtale';

import apiClient from './apiClient';

export const settNyDatoForKontrollsamtale = (args: { sakId: string; nyDato: Date }) =>
    apiClient({
        url: '/kontrollsamtale/nyDato',
        method: 'POST',
        body: args,
    });

export const fetchNesteKontrollsamtale = (sakId: string) =>
    apiClient<Kontrollsamtale | null>({
        url: `/kontrollsamtale/hent/${sakId}`,
        method: 'GET',
    });
