import { Nullable } from '~src/lib/types';
import { UnderkjennelseGrunn } from '~src/types/Behandling';
import { Skatteoppslag } from '~src/types/skatt/Skatt';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';

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
    }
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
    behandlingId: string
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

export async function iverksett(arg: { sakId: string; behandlingId: string }) {
    return apiClient<Søknadsbehandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/iverksett`,
        method: 'PATCH',
    });
}

export async function underkjenn(arg: {
    sakId: string;
    behandlingId: string;
    grunn: UnderkjennelseGrunn;
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

export async function hentSkattegrunnlagForBehandling(arg: {
    sakId: string;
    behandlingId: string;
}): Promise<ApiClientResult<Skatteoppslag>> {
    return apiClient({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/samletSkattegrunnlag`,
        method: 'GET',
    });
}
