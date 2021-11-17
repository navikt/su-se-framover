import { Nullable } from '~lib/types';

import apiClient, { ApiClientResult } from './apiClient';

export async function opprettKlage(arg: { sakId: string; journalpostId: string }): Promise<ApiClientResult<unknown>> {
    return apiClient({
        url: `/saker/${arg.sakId}/klager`,
        method: 'POST',
        body: {
            journalpostId: arg.journalpostId,
        },
    });
}

export async function vilkårsvurder(arg: {
    sakId: string;
    klageId: string;
    vedtakId: string;
    innenforFristen: boolean;
    klagesDetPåKonkreteElementerIVedtaket: boolean;
    erUnderskrevet: boolean;
    begrunnelse: Nullable<string>;
}): Promise<ApiClientResult<unknown>> {
    return apiClient({
        url: `/saker/${arg.sakId}/klager/${arg.klageId}/vilkår/vurderinger`,
        method: 'POST',
        body: {
            vedtakId: arg.vedtakId,
            innenforFristen: arg.innenforFristen,
            klagesDetPåKonkreteElementerIVedtaket: arg.klagesDetPåKonkreteElementerIVedtaket,
            erUnderskrevet: arg.erUnderskrevet,
            begrunnelse: arg.begrunnelse,
        },
    });
}
