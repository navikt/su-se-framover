import { Nullable } from '~src/lib/types';
import { UnderkjennelseGrunnBehandling } from '~src/types/Behandling';
import { Klage } from '~src/types/Klage';
import { FormkravRequest, VurderingRequest } from '~src/utils/klage/klageUtils';

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

export async function lagreAvvistFritekst(arg: {
    sakId: string;
    klageId: string;
    fritekstTilBrev: Nullable<string>;
}): Promise<ApiClientResult<Klage>> {
    return apiClient({
        url: `/saker/${arg.sakId}/klager/${arg.klageId}/avvist/fritekstTilBrev`,
        method: 'POST',
        body: {
            fritekst: arg.fritekstTilBrev,
        },
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

export async function iverksettAvvistKlage(arg: { sakId: string; klageId: string }): Promise<ApiClientResult<Klage>> {
    return apiClient({
        url: `/saker/${arg.sakId}/klager/${arg.klageId}/iverksett(AvvistKlage)`,
        method: 'POST',
    });
}

export async function underkjenn(arg: {
    sakId: string;
    klageId: string;
    grunn: UnderkjennelseGrunnBehandling;
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

export async function avslutt(arg: {
    sakId: string;
    klageId: string;
    begrunnelse: string;
}): Promise<ApiClientResult<Klage>> {
    return apiClient({
        url: `/saker/${arg.sakId}/klager/${arg.klageId}/avslutt`,
        method: 'POST',
        body: {
            begrunnelse: arg.begrunnelse,
        },
    });
}
