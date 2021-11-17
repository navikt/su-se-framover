import { Nullable } from '~lib/types';
import { Behandling, UnderkjennelseGrunn } from '~types/Behandling';
import { Behandlingsinformasjon } from '~types/Behandlingsinformasjon';
import { Fradrag } from '~types/Fradrag';
import { UføreResultat } from '~types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Utenlandsoppholdstatus } from '~types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { Periode } from '~types/Periode';
import { Vilkårtype, VilkårVurderingStatus } from '~types/Vilkårsvurdering';

import apiClient, { ApiClientResult } from './apiClient';

export async function startBehandling(arg: { sakId: string; søknadId: string }): Promise<ApiClientResult<Behandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/behandlinger`,
        method: 'POST',
        body: {
            soknadId: arg.søknadId,
        },
    });
}

export async function hentBehandling(sakId: string, behandlingId: string): Promise<ApiClientResult<Behandling>> {
    return apiClient({
        url: `/saker/${sakId}/behandlinger/${behandlingId}`,
        method: 'GET',
    });
}

export async function startBeregning(
    sakId: string,
    behandlingId: string,
    arg: {
        begrunnelse: Nullable<string>;
    }
): Promise<ApiClientResult<Behandling>> {
    return apiClient({
        url: `/saker/${sakId}/behandlinger/${behandlingId}/beregn`,
        method: 'POST',
        body: {
            begrunnelse: arg.begrunnelse,
        },
    });
}

export async function lagreFradragsgrunnlag(
    sakId: string,
    behandlingId: string,
    fradrag: Fradrag[]
): Promise<ApiClientResult<Behandling>> {
    return apiClient({
        url: `/saker/${sakId}/behandlinger/${behandlingId}/grunnlag/fradrag`,
        method: 'POST',
        body: {
            fradrag: fradrag,
        },
    });
}

export async function lagreVirkningstidspunkt(arg: {
    sakId: string;
    behandlingId: string;
    fraOgMed: string;
    tilOgMed: string;
    begrunnelse: string;
}) {
    return apiClient<Behandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/stønadsperiode`,
        method: 'POST',
        body: {
            periode: { fraOgMed: arg.fraOgMed, tilOgMed: arg.tilOgMed },
            begrunnelse: arg.begrunnelse,
        },
    });
}

export async function lagreVilkårsvurdering(arg: {
    sakId: string;
    behandlingId: string;
    vilkårsvurderingId: string;
    vilkårtype: Vilkårtype;
    status: VilkårVurderingStatus;
    begrunnelse: string;
}) {
    return apiClient<Behandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/vilkarsvurderinger`,
        method: 'PATCH',
        body: {
            [arg.vilkårtype]: {
                id: arg.vilkårsvurderingId,
                begrunnelse: arg.begrunnelse,
                status: arg.status,
            },
        },
    });
}

export async function lagreBehandlingsinformasjon(arg: {
    sakId: string;
    behandlingId: string;
    behandlingsinformasjon: Partial<Behandlingsinformasjon>;
}) {
    return apiClient<Behandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/informasjon`,
        method: 'PATCH',
        body: arg.behandlingsinformasjon,
    });
}

export async function lagreGrunnlagEps(arg: { sakId: string; behandlingId: string; epsFnr: Nullable<string> }) {
    return apiClient<Behandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/grunnlag/bosituasjon/eps`,
        method: 'POST',
        body: {
            epsFnr: arg.epsFnr,
        },
    });
}

export async function lagreGrunnlagEpsSkjermet(arg: { sakId: string; behandlingId: string; epsFnr: string }) {
    return apiClient({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/grunnlag/bosituasjon/eps/skjermet`,
        method: 'POST',
        body: {
            epsFnr: arg.epsFnr,
        },
        bodyTransformer: () => Promise.resolve({}),
    });
}

export async function lagreGrunnlagBosituasjon(arg: {
    sakId: string;
    behandlingId: string;
    bosituasjon: string;
    begrunnelse: Nullable<string>;
}) {
    return apiClient<Behandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/grunnlag/bosituasjon/fullfør`,
        method: 'POST',
        body: {
            bosituasjon: arg.bosituasjon,
            begrunnelse: arg.begrunnelse,
        },
    });
}

// Denne vil kanskje på sikt låse behandlingen også.
export async function simulerBehandling(sakId: string, behandlingId: string): Promise<ApiClientResult<Behandling>> {
    return apiClient({
        url: `/saker/${sakId}/behandlinger/${behandlingId}/simuler`,
        method: 'POST',
    });
}

export async function sendTilAttestering(arg: {
    sakId: string;
    behandlingId: string;
    fritekstTilBrev: string;
}): Promise<ApiClientResult<Behandling>> {
    return apiClient<Behandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/tilAttestering`,
        method: 'POST',
        body: {
            fritekst: arg.fritekstTilBrev,
        },
    });
}

export async function iverksett(arg: { sakId: string; behandlingId: string }) {
    return apiClient<Behandling>({
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
    return apiClient<Behandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/underkjenn`,
        method: 'PATCH',
        body: {
            grunn: arg.grunn,
            kommentar: arg.kommentar,
        },
    });
}

export async function lagreUtenlandsopphold(arg: {
    sakId: string;
    behandlingId: string;
    status: Utenlandsoppholdstatus;
    begrunnelse: Nullable<string>;
    periode: Periode<string>;
}): Promise<ApiClientResult<Behandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/utenlandsopphold`,
        method: 'POST',
        body: {
            status: arg.status,
            begrunnelse: arg.begrunnelse,
            periode: arg.periode,
        },
    });
}

export async function lagreUføregrunnlag(arg: {
    sakId: string;
    behandlingId: string;
    periode: Periode<string>;
    uføregrad: Nullable<number>;
    forventetInntekt: Nullable<number>;
    begrunnelse: string;
    resultat: UføreResultat;
}) {
    return apiClient<Behandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/grunnlag/uføre`,
        method: 'POST',
        body: {
            uføregrad: arg.uføregrad,
            forventetInntekt: arg.forventetInntekt,
            periode: {
                fraOgMed: arg.periode.fraOgMed,
                tilOgMed: arg.periode.tilOgMed,
            },
            begrunnelse: arg.begrunnelse,
            resultat: arg.resultat,
        },
    });
}
