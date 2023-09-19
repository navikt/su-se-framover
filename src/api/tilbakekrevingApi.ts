import { Kravgrunnlag } from '~src/types/Kravgrunnlag';

import apiClient, { ApiClientResult } from './apiClient';

export async function hentSisteFerdigbehandledeKravgrunnlag(arg: {
    sakId: string;
}): Promise<ApiClientResult<Kravgrunnlag>> {
    return apiClient({
        url: `/saker/${arg.sakId}/tilbakekreving/sisteKravgrunnlag`,
        method: 'GET',
    });
}
