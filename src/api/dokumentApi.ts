import { Dokument, DokumentIdType } from '~pages/saksbehandling/dokument/Dokument';

import apiClient, { ApiClientResult } from './apiClient';

export async function hentDokumenter(id: string, idType: DokumentIdType): Promise<ApiClientResult<Dokument[]>> {
    return apiClient({
        url: `/dokumenter?id=${id}&idType=${idType}`,
        method: 'GET',
    });
}
