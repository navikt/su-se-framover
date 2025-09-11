import { Nullable } from '~src/lib/types';
import { UnderkjennelseGrunnBehandling } from '~src/types/Behandling';
import {
    EksisterendeVedtaksinformasjonTidligerePeriodeRequest,
    EksisterendeVedtaksinformasjonTidligerePeriodeResponse,
    SkattegrunnlagSøknadsbehandlingRequest,
    Søknadsbehandling,
} from '~src/types/Søknadsbehandling';

import apiClient, { ApiClientResult } from './apiClient';

export async function startBehandling(arg: {
    sakId: string;
    søknadId: string;
}): Promise<ApiClientResult<Søknadsbehandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/behandlinger`,
        method: 'POST',
        body: {
            soknadId: arg.søknadId,
        },
    });
}

export async function startBeregning(
    sakId: string,
    behandlingId: string,
    arg: {
        begrunnelse: Nullable<string>;
    },
): Promise<ApiClientResult<Søknadsbehandling>> {
    return apiClient({
        url: `/saker/${sakId}/behandlinger/${behandlingId}/beregn`,
        method: 'POST',
        body: {
            begrunnelse: arg.begrunnelse,
        },
    });
}

export async function lagreVirkningstidspunkt(arg: {
    sakId: string;
    behandlingId: string;
    fraOgMed: string;
    tilOgMed: string;
    harSaksbehandlerAvgjort: boolean;
}): Promise<ApiClientResult<Søknadsbehandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/stønadsperiode`,
        method: 'POST',
        body: {
            periode: { fraOgMed: arg.fraOgMed, tilOgMed: arg.tilOgMed },
            harSaksbehandlerAvgjort: arg.harSaksbehandlerAvgjort,
        },
    });
}

export async function simulerBehandling(
    sakId: string,
    behandlingId: string,
): Promise<ApiClientResult<Søknadsbehandling>> {
    return apiClient({
        url: `/saker/${sakId}/behandlinger/${behandlingId}/simuler`,
        method: 'POST',
    });
}

export async function sendTilAttestering(arg: {
    sakId: string;
    behandlingId: string;
    fritekstTilBrev: string;
}): Promise<ApiClientResult<Søknadsbehandling>> {
    return apiClient<Søknadsbehandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/tilAttestering`,
        method: 'POST',
        body: {
            fritekst: arg.fritekstTilBrev,
        },
    });
}

export async function returSak(arg: { sakId: string; behandlingId: string }) {
    return apiClient<Søknadsbehandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/returSak`,
        method: 'PATCH',
    });
}

export async function iverksett(arg: { sakId: string; behandlingId: string }) {
    return apiClient<Søknadsbehandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/iverksett`,
        method: 'PATCH',
    });
}

export async function underkjenn(arg: {
    sakId: string;
    behandlingId: string;
    grunn: UnderkjennelseGrunnBehandling;
    kommentar: string;
}) {
    return apiClient<Søknadsbehandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/underkjenn`,
        method: 'PATCH',
        body: {
            grunn: arg.grunn,
            kommentar: arg.kommentar,
        },
    });
}

export async function hentNySkattegrunnlag(
    arg: SkattegrunnlagSøknadsbehandlingRequest,
): Promise<ApiClientResult<Søknadsbehandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/samletSkattegrunnlag`,
        method: 'POST',
        body: {
            fra: arg.fra,
            til: arg.til,
        },
    });
}

export async function gjeldendeVedtaksdataTidligerePeriode(
    arg: EksisterendeVedtaksinformasjonTidligerePeriodeRequest,
): Promise<ApiClientResult<EksisterendeVedtaksinformasjonTidligerePeriodeResponse>> {
    return apiClient({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/gjeldendeVedtaksdata/tidligereperiode`,
        method: 'GET',
    });
}
