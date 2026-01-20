import apiClient, { ApiClientResult } from './apiClient';

export interface Fritekst {
    referanseId: string;
    sakId: string;
    type: FritekstTyper;
    fritekst: string;
}

export const FritekstTyper = {
    FRITEKST_BREV: 'FRITEKST_BREV',
    FORHÅNDSVARSEL_TILBAKEKREVING: 'FORHÅNDSVARSEL_TILBAKEKREVING',
    VEDTAKSBREV_SØKNADSBEHANDLING: 'VEDTAKSBREV_SØKNADSBEHANDLING',
    VEDTAKSBREV_REVURDERING: 'VEDTAKSBREV_REVURDERING',
} as const;

export type FritekstTyper = (typeof FritekstTyper)[keyof typeof FritekstTyper];

export async function redigerFritekst(arg: Fritekst): Promise<ApiClientResult<object>> {
    return apiClient({
        url: `/fritekst/lagre`,
        method: 'POST',
        body: arg,
    });
}

export async function hentFritekst(arg: {
    referanseId: string;
    sakId: string;
    type: FritekstTyper;
}): Promise<ApiClientResult<Fritekst>> {
    return apiClient({
        url: `/fritekst`,
        method: 'POST',
        body: {
            referanseId: arg.referanseId,
            sakId: arg.sakId,
            type: arg.type,
        },
    });
}
