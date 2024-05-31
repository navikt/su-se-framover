import { Dokument, DokumentIdType } from '~src/types/dokument/Dokument';

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

export const getDokument = (arg: { dokumentId: string }) => {
    return apiClient<Blob>({
        url: `/dokumenter/${arg.dokumentId}`,
        method: 'GET',
        request: { headers: new Headers({ Accept: 'application/pdf' }) },
        bodyTransformer: (res) => res.blob(),
    });
};
