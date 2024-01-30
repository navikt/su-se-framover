import { Søknadsbehandling } from '~src/types/Søknadsbehandling';

import apiClient, { ApiClientResult } from './apiClient';

export async function startNyBehandling(arg: {
    sakId: string;
    vedtakId: string;
}): Promise<ApiClientResult<Søknadsbehandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/vedtak/${arg.vedtakId}/nyBehandling`,
        method: 'POST',
    });
}
