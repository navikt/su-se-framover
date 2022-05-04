import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { Restans } from '~src/types/Restans';
import { BegrensetSakinfo, Sak } from '~src/types/Sak';

import apiClient, { ApiClientResult } from './apiClient';

export async function fetchSakByFnr(fnr: string): Promise<ApiClientResult<Sak>> {
    return apiClient({
        url: `/saker/søk`,
        method: 'POST',
        body: {
            fnr: fnr,
        },
    });
}

export async function fetchSakBySaksnummer(saksnummer: string): Promise<ApiClientResult<Sak>> {
    return apiClient({
        url: `/saker/søk`,
        method: 'POST',
        body: {
            saksnummer: saksnummer,
        },
    });
}

export async function fetchSakBySakId(sakId: string): Promise<ApiClientResult<Sak>> {
    return apiClient({ url: `/saker/${sakId}`, method: 'GET' });
}

export async function hentÅpneBehandlinger(): Promise<ApiClientResult<Restans[]>> {
    return apiClient({ url: `/saker/behandlinger/apne`, method: 'GET' });
}

export async function hentFerdigeBehandlinger(): Promise<ApiClientResult<Restans[]>> {
    return apiClient({ url: `/saker/behandlinger/ferdige`, method: 'GET' });
}

export async function hentBegrensetSakinfo(fnr: string): Promise<ApiClientResult<BegrensetSakinfo>> {
    return apiClient({ url: `/saker/info/${fnr}`, method: 'GET' });
}

export async function hentgjeldendeGrunnlagsdataOgVilkårsvurderinger({
    sakId,
    fraOgMed,
    tilOgMed,
}: {
    sakId: string;
    fraOgMed: string;
    tilOgMed?: string;
}): Promise<ApiClientResult<{ grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger }>> {
    return apiClient({
        url: `/saker/${sakId}/gjeldendeVedtaksdata`,
        method: 'POST',
        body: {
            fraOgMed: fraOgMed,
            tilOgMed: tilOgMed ?? null,
        },
    });
}

export async function kallInnTilKontrollsamtale(sakId: string) {
    return apiClient({
        url: `/kontrollsamtale/kallInn`,
        method: 'POST',
        body: {
            sakId: sakId,
        },
    });
}
