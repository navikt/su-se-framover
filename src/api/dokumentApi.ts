import { DistribuerDokumentRequest } from '~src/pages/drift/components/dokument/DokumentDistribusjonUtils';
import { Dokument, DokumentIdType } from '~src/types/dokument/Dokument';
import { KlageinstansDokument } from '~src/types/dokument/KlageinstansDokument';

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

export async function hentEksterneDokumenter(arg: { sakId: string }): Promise<ApiClientResult<KlageinstansDokument[]>> {
    return apiClient({
        url: `/dokumenter/eksterne?sakId=${arg.sakId}`,
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

export async function distribuerDokument(args: DistribuerDokumentRequest): Promise<ApiClientResult<Dokument>> {
    return apiClient({
        url: `sak/${args.sakId}/dokumenter/${args.dokumentId}/distribuer`,
        method: 'POST',
        body: {
            adresselinje1: args.adressadresselinje1,
            adresselinje2: args.adressadresselinje2,
            adresselinje3: args.adressadresselinje3,
            postnummer: args.postnummer,
            poststed: args.poststed,
        },
        request: { headers: new Headers({ Accept: 'application/json' }) },
    });
}
