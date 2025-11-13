import apiClient, { ApiClientResult } from './apiClient';

export interface Fritekst {
    referanseId: string;
    type: FritekstTyper;
    fritekst: string;
}

type FritekstTyper = 'FRITEKST_BREV' | 'FORHÅNDSVARSEL_TILBAKEKREVING';

export async function redigerFritekst(arg: Fritekst): Promise<ApiClientResult<object>> {
    return apiClient({
        url: `/fritekst/lagre`,
        method: 'POST',
        body: arg,
    });
}

export async function hentFritekst(arg: {
    referanseId: string;
    type: FritekstTyper;
}): Promise<ApiClientResult<Fritekst>> {
    console.log('hentRequest');
    return apiClient({
        url: `/fritekst`,
        method: 'POST',
        body: {
            referanseId: arg.referanseId,
            type: arg.type,
        },
    });
}
