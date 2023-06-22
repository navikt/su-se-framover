import { Kontrollsamtale } from '~src/types/Kontrollsamtale';
import { toStringDateOrNull } from '~src/utils/date/dateUtils';

import apiClient from './apiClient';

export const settNyDatoForKontrollsamtale = (args: { sakId: string; nyDato: Date }) =>
    apiClient({
        url: '/kontrollsamtale/nyDato',
        method: 'POST',
        body: {
            sakId: args.sakId,
            nyDato: toStringDateOrNull(args.nyDato),
        },
    });

export const fetchNesteKontrollsamtale = (sakId: string) =>
    apiClient<Kontrollsamtale>({
        url: `/kontrollsamtale/hent/${sakId}`,
        method: 'GET',
    });

export const hentKontrollsamtaler = (arg: { sakId: string }) =>
    apiClient<Kontrollsamtale[]>({
        url: `/kontrollsamtaler/${arg.sakId}`,
        method: 'GET',
    });
