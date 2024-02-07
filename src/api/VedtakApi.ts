import { Søknadsbehandling } from '~src/types/Søknadsbehandling';

import apiClient, { ApiClientResult } from './apiClient';

export async function startNySøknadsbehandling(arg: {
    sakId: string;
    vedtakId: string;
}): Promise<ApiClientResult<Søknadsbehandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/vedtak/${arg.vedtakId}/nySoknadsbehandling`,
        method: 'POST',
    });
}
