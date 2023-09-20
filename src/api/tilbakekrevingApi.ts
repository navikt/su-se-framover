import { Kravgrunnlag } from '~src/types/Kravgrunnlag';
import { ManuellTilbakekrevingsbehandling } from '~src/types/ManuellTilbakekrevingsbehandling';

import apiClient, { ApiClientResult } from './apiClient';

export async function hentSisteFerdigbehandledeKravgrunnlag(arg: {
    sakId: string;
}): Promise<ApiClientResult<Kravgrunnlag>> {
    return apiClient({
        url: `/saker/${arg.sakId}/tilbakekreving/sisteKravgrunnlag`,
        method: 'GET',
    });
}

export async function opprettNyTilbakekrevingsbehandling(arg: {
    sakId: string;
}): Promise<ApiClientResult<ManuellTilbakekrevingsbehandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/tilbakekreving/ny`,
        method: 'POST',
    });
}
