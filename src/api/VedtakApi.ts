import { Omgjøringsfom } from '~src/pages/saksbehandling/sakintro/Vedtakstabell/OmgjøringModal.tsx';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';

import apiClient, { ApiClientResult } from './apiClient';

export async function startNySøknadsbehandling(arg: {
    sakId: string;
    vedtakId: string;
    body: Omgjøringsfom;
}): Promise<ApiClientResult<Søknadsbehandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/vedtak/${arg.vedtakId}/nySoknadsbehandling`,
        method: 'POST',
        body: {
            årsak: arg.body.årsak,
            omgjøringsgrunn: arg.body.omgjøringGrunn,
        },
    });
}
