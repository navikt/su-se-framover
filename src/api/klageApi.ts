import { Nullable } from '~lib/types';
import { Klage } from '~types/Klage';
import { VurderingRequest } from '~utils/klage/klageUtils';

import apiClient, { ApiClientResult } from './apiClient';

export async function opprettKlage(arg: { sakId: string; journalpostId: string }): Promise<ApiClientResult<Klage>> {
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
}): Promise<ApiClientResult<Klage>> {
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

export async function lagreVurderingAvKlage(arg: VurderingRequest): Promise<ApiClientResult<Klage>> {
    return apiClient({
        url: `/saker/${arg.sakId}/klager/${arg.klageId}/vurderinger`,
        method: 'POST',
        body: {
            omgjør: arg.omgjør,
            oppretthold: arg.oppretthold,
            fritekstTilBrev: arg.fritekstTilBrev,
        },
    });
}

export async function sendTilAttestering(arg: { sakId: string; klageId: string }): Promise<ApiClientResult<Klage>> {
    return apiClient({
        url: `/saker/${arg.sakId}/klager/${arg.klageId}/vurderinger`,
        method: 'POST',
    });
}
