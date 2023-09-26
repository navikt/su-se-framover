import { Kravgrunnlag } from '~src/types/Kravgrunnlag';
import {
    ManuellTilbakekrevingsbehandling,
    OpprettNyTilbakekrevingsbehandlingRequest,
    VurderTilbakekrevingsbehandlingRequest,
} from '~src/types/ManuellTilbakekrevingsbehandling';

import apiClient, { ApiClientResult } from './apiClient';

export async function hentSisteFerdigbehandledeKravgrunnlag(arg: {
    sakId: string;
}): Promise<ApiClientResult<Kravgrunnlag>> {
    return apiClient({
        url: `/saker/${arg.sakId}/tilbakekreving/sisteKravgrunnlag`,
        method: 'GET',
    });
}

export async function opprettNyTilbakekrevingsbehandling(
    arg: OpprettNyTilbakekrevingsbehandlingRequest,
): Promise<ApiClientResult<ManuellTilbakekrevingsbehandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/tilbakekreving/ny`,
        method: 'POST',
        body: {
            saksversjon: arg.saksversjon,
        },
    });
}

export async function vurderTilbakekrevingsbehandling(
    arg: VurderTilbakekrevingsbehandlingRequest,
): Promise<ApiClientResult<ManuellTilbakekrevingsbehandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/tilbakekreving/${arg.behandlingId}/manedsvurder`,
        method: 'POST',
        body: {
            versjon: arg.saksversjon,
            måneder: arg.måneder,
        },
    });
}
