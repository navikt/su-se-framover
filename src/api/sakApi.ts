import { AvsluttetBegrunnelse } from '~pages/saksbehandling/sakintro/AvslutteBehandling';
import { Sak } from '~types/Sak';

import apiClient, { ApiClientResult } from './apiClient';

export async function fetchSakByFnr(fnr: string): Promise<ApiClientResult<Sak>> {
    return apiClient({ url: `/saker?fnr=${fnr}`, method: 'GET' });
}

export async function fetchSakBySakId(sakId: string): Promise<ApiClientResult<Sak>> {
    return apiClient({ url: `/saker/${sakId}`, method: 'GET' });
}

export async function slettSaksbehandling(arg: {
    sakId: string;
    søknadId: string;
    avsluttetBegrunnelse: AvsluttetBegrunnelse;
}): Promise<ApiClientResult<string>> {
    return apiClient({
        url: `/saker/${arg.sakId}/${arg.søknadId}/avsluttSaksbehandling`,
        method: 'POST',
        body: {
            sakId: arg.sakId,
            søknadId: arg.søknadId,
            avsluttetBegrunnelse: arg.avsluttetBegrunnelse,
        },
    });
}
