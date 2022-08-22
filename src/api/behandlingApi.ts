import { Nullable } from '~src/lib/types';
import { UnderkjennelseGrunn } from '~src/types/Behandling';
import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { Fradrag } from '~src/types/Fradrag';
import { Aldersvurdering } from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår';
import { UfullstendigBosituasjonRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { FormueVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { InstitusjonsoppholdVurderingRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/institusjonsopphold/Institusjonsopphold';
import { LovligOppholdRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/lovligOpphold/LovligOppholdVilkår';
import { PersonligOppmøteÅrsak } from '~src/types/grunnlagsdataOgVilkårsvurderinger/personligOppmøte/PersonligOppmøte';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Utenlandsoppholdstatus } from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { Periode } from '~src/types/Periode';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { Vilkårtype, VilkårVurderingStatus } from '~src/types/Vilkårsvurdering';

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

export async function hentBehandling(sakId: string, behandlingId: string): Promise<ApiClientResult<Søknadsbehandling>> {
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
): Promise<ApiClientResult<Søknadsbehandling>> {
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
): Promise<ApiClientResult<Søknadsbehandling>> {
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
}) {
    return apiClient<Søknadsbehandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/stønadsperiode`,
        method: 'POST',
        body: {
            periode: { fraOgMed: arg.fraOgMed, tilOgMed: arg.tilOgMed },
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
    return apiClient<Søknadsbehandling>({
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

export async function lagreFlyktningVilkår(arg: {
    sakId: string;
    behandlingId: string;
    vurderinger: Array<{
        vurdering: Vilkårstatus;
        periode: Periode<string>;
    }>;
}) {
    return apiClient<Søknadsbehandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/flyktning`,
        method: 'POST',
        body: arg.vurderinger,
    });
}

export async function lagreFastOppholdVilkår(arg: {
    sakId: string;
    behandlingId: string;
    vurderinger: Array<{ vurdering: Vilkårstatus; periode: Periode<string> }>;
}) {
    return apiClient<Søknadsbehandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/fastopphold`,
        method: 'POST',
        body: arg.vurderinger,
    });
}

export async function lagreInstitusjonsoppholdVilkår(arg: {
    sakId: string;
    behandlingId: string;
    vurderingsperioder: InstitusjonsoppholdVurderingRequest[];
}) {
    return apiClient<Søknadsbehandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/institusjonsopphold`,
        method: 'POST',
        body: {
            vurderingsperioder: arg.vurderingsperioder,
        },
    });
}

export async function lagrePersonligOppmøteVilkår(arg: {
    sakId: string;
    behandlingId: string;
    vurderinger: Array<{ vurdering: PersonligOppmøteÅrsak; periode: Periode<string> }>;
}) {
    return apiClient<Søknadsbehandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/personligoppmøte`,
        method: 'POST',
        body: arg.vurderinger,
    });
}

export async function lagreGrunnlagEps(arg: UfullstendigBosituasjonRequest) {
    return apiClient<Søknadsbehandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/grunnlag/bosituasjon/eps`,
        method: 'POST',
        body: {
            epsFnr: arg.epsFnr,
        },
    });
}

export async function lagreGrunnlagEpsSkjermet(arg: UfullstendigBosituasjonRequest<string>) {
    return apiClient({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/grunnlag/bosituasjon/eps/skjermet`,
        method: 'POST',
        body: {
            epsFnr: arg.epsFnr,
        },
        bodyTransformer: () => Promise.resolve({}),
    });
}

export async function lagreGrunnlagBosituasjon(arg: { sakId: string; behandlingId: string; bosituasjon: string }) {
    return apiClient<Søknadsbehandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/grunnlag/bosituasjon/fullfør`,
        method: 'POST',
        body: {
            bosituasjon: arg.bosituasjon,
        },
    });
}

// Denne vil kanskje på sikt låse behandlingen også.
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

export async function lagreUtenlandsopphold(arg: {
    sakId: string;
    behandlingId: string;
    status: Utenlandsoppholdstatus;
    periode: Periode<string>;
}): Promise<ApiClientResult<Søknadsbehandling>> {
    return apiClient({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/utenlandsopphold`,
        method: 'POST',
        body: {
            status: arg.status,
            periode: arg.periode,
        },
    });
}

export async function lagreUføregrunnlag(arg: {
    sakId: string;
    behandlingId: string;
    vurderinger: Array<{
        periode: Periode<string>;
        uføregrad: Nullable<number>;
        forventetInntekt: Nullable<number>;
        resultat: UføreResultat;
    }>;
}) {
    return apiClient<Søknadsbehandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/grunnlag/uføre`,
        method: 'POST',
        body: { vurderinger: arg.vurderinger },
    });
}

export async function lagreLovligOppholdVilkår(arg: LovligOppholdRequest) {
    return apiClient<Søknadsbehandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/lovligOpphold`,
        method: 'POST',
        body: { vurderinger: arg.vurderinger },
    });
}

export async function lagreAldersgrunnlag(arg: {
    sakId: string;
    behandlingId: string;
    vurderinger: Aldersvurdering[];
}) {
    return apiClient<Søknadsbehandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/pensjon`,
        method: 'POST',
        body: arg.vurderinger,
    });
}

export async function lagreFamilieforeningsgrunnlag(arg: {
    sakId: string;
    behandlingId: string;
    vurderinger: Array<{ status: Vilkårstatus }>;
}) {
    return apiClient<Søknadsbehandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/familiegjenforening`,
        method: 'POST',
        body: { vurderinger: arg.vurderinger },
    });
}

export async function lagreFormuegrunnlag(arg: FormueVilkårRequest) {
    return apiClient<Søknadsbehandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/formuegrunnlag`,
        method: 'POST',
        body: arg.vurderinger,
    });
}
