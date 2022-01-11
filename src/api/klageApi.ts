import { UnderkjennelseGrunn } from '~types/Behandling';
import { Klage } from '~types/Klage';
import { FormkravRequest, VurderingRequest } from '~utils/klage/klageUtils';

import apiClient, { ApiClientResult } from './apiClient';

export async function opprettKlage(arg: {
    sakId: string;
    journalpostId: string;
    datoKlageMottatt: string;
}): Promise<ApiClientResult<Klage>> {
    return apiClient({
        url: `/saker/${arg.sakId}/klager`,
        method: 'POST',
        body: {
            journalpostId: arg.journalpostId,
            datoKlageMottatt: arg.datoKlageMottatt,
        },
    });
}

export async function vilkårsvurder(arg: FormkravRequest): Promise<ApiClientResult<Klage>> {
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

export async function bekreftVilkårsvurderinger(arg: {
    sakId: string;
    klageId: string;
}): Promise<ApiClientResult<Klage>> {
    return apiClient({
        url: `/saker/${arg.sakId}/klager/${arg.klageId}/vilkår/vurderinger/bekreft`,
        method: 'POST',
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

export async function bekreftVurderinger(arg: { sakId: string; klageId: string }): Promise<ApiClientResult<Klage>> {
    return apiClient({
        url: `/saker/${arg.sakId}/klager/${arg.klageId}/vurderinger/bekreft`,
        method: 'POST',
    });
}

export async function sendTilAttestering(arg: { sakId: string; klageId: string }): Promise<ApiClientResult<Klage>> {
    return apiClient({
        url: `/saker/${arg.sakId}/klager/${arg.klageId}/tilAttestering`,
        method: 'POST',
    });
}

export async function oversend(arg: { sakId: string; klageId: string }): Promise<ApiClientResult<Klage>> {
    return apiClient({
        url: `/saker/${arg.sakId}/klager/${arg.klageId}/oversend`,
        method: 'POST',
    });
}

export async function avvis(arg: { sakId: string; klageId: string }): Promise<ApiClientResult<Klage>> {
    return apiClient({
        url: `/saker/${arg.sakId}/klager/${arg.klageId}/avvis`,
        method: 'POST',
    });
}

export async function underkjenn(arg: {
    sakId: string;
    klageId: string;
    grunn: UnderkjennelseGrunn;
    kommentar: string;
}): Promise<ApiClientResult<Klage>> {
    return apiClient({
        url: `/saker/${arg.sakId}/klager/${arg.klageId}/underkjenn`,
        method: 'POST',
        body: {
            grunn: arg.grunn,
            kommentar: arg.kommentar,
        },
    });
}
