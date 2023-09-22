import { Kravgrunnlag } from '~src/types/Kravgrunnlag';
import { ManuellTilbakekrevingsbehandling, TilbakekrevingsValg } from '~src/types/ManuellTilbakekrevingsbehandling';
import { Periode } from '~src/types/Periode';

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

export async function vurderTilbakekrevingsbehandling(arg: {
    sakId: string;
    behandlingId: string;
    vurderinger: Array<{ periode: Periode<string>; valg: TilbakekrevingsValg }>;
}): Promise<ApiClientResult<ManuellTilbakekrevingsbehandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/tilbakekreving/${arg.behandlingId}/vurdering`,
        method: 'POST',
        body: {
            vurderinger: arg.vurderinger,
        },
    });
}
