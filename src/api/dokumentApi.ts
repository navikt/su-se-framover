import { Dokument, DokumentIdType } from '~types/dokument/Dokument';

import apiClient, { ApiClientResult } from './apiClient';

export async function hentDokumenter(arg: {
    id: string;
    idType: DokumentIdType;
}): Promise<ApiClientResult<Dokument[]>> {
    return apiClient({
        url: `/dokumenter?id=${arg.id}&idType=${arg.idType}`,
        method: 'GET',
    });
}
