import { Kontrollsamtale } from '~src/types/Kontrollsamtale';
import { toStringDateOrNull } from '~src/utils/date/dateUtils';

import apiClient from './apiClient';

export const settNyDatoForKontrollsamtale = (args: { sakId: string; nyDato: Date }) =>
    apiClient({
        url: `/saker/${args.sakId}/kontrollsamtaler/nyDato`,
        method: 'POST',
        body: {
            nyDato: toStringDateOrNull(args.nyDato),
        },
    });

export const fetchNesteKontrollsamtale = (sakId: string) =>
    apiClient<Kontrollsamtale>({
        url: `/saker/${sakId}/kontrollsamtaler/hent`,
        method: 'GET',
    });

export const hentKontrollsamtaler = (arg: { sakId: string }) =>
    apiClient<Kontrollsamtale[]>({
        url: `/saker/${arg.sakId}/kontrollsamtaler`,
        method: 'GET',
    });
