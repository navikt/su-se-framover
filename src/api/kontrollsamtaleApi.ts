import { Kontrollsamtale } from '~types/Kontrollsamtale';
import { toStringDateOrNull } from '~utils/date/dateUtils';

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
    apiClient<Kontrollsamtale | null>({
        url: `/kontrollsamtale/hent/${sakId}`,
        method: 'GET',
    });
