import { formatISO } from 'date-fns';

import { Nullable } from '~lib/types';
import { UnderkjennRevurderingGrunn } from '~pages/saksbehandling/attestering/attesterRevurdering/AttesterRevurdering';
import { Fradrag } from '~types/Fradrag';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { UføreResultat } from '~types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Periode } from '~types/Periode';
import {
    OpprettetRevurdering,
    SimulertRevurdering,
    RevurderingTilAttestering,
    IverksattRevurdering,
    UnderkjentRevurdering,
    OpprettetRevurderingGrunn,
    RevurderingErrorCodes,
    BeslutningEtterForhåndsvarsling,
    LeggTilUføreResponse,
    InformasjonSomRevurderes,
    Revurdering,
    BosituasjonRequest,
    FormuegrunnlagRequest,
} from '~types/Revurdering';

import apiClient, { ApiClientResult, ErrorMessage } from './apiClient';

export async function opprettRevurdering(
    sakId: string,
    fraOgMed: Date,
    årsak: OpprettetRevurderingGrunn,
    informasjonSomRevurderes: InformasjonSomRevurderes[],
    begrunnelse: string
): Promise<ApiClientResult<OpprettetRevurdering>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger`,
        method: 'POST',
        body: {
            fraOgMed: formatISO(fraOgMed, { representation: 'date' }),
            årsak: årsak,
            informasjonSomRevurderes: informasjonSomRevurderes,
            begrunnelse: begrunnelse,
        },
    });
}

export async function oppdaterRevurdering(
    sakId: string,
    revurderingId: string,
    fraOgMed: Date,
    årsak: OpprettetRevurderingGrunn,
    informasjonSomRevurderes: InformasjonSomRevurderes[],
    begrunnelse: string
): Promise<ApiClientResult<OpprettetRevurdering>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}`,
        method: 'PUT',
        body: {
            fraOgMed: formatISO(fraOgMed, { representation: 'date' }),
            årsak: årsak,
            informasjonSomRevurderes: informasjonSomRevurderes,
            begrunnelse: begrunnelse,
        },
    });
}

export async function beregnOgSimuler(
    sakId: string,
    arg: {
        revurderingId: string;
        periode: Periode<string>;
    }
): Promise<ApiClientResult<{ revurdering: SimulertRevurdering; feilmeldinger: ErrorMessage[] }>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${arg.revurderingId}/beregnOgSimuler`,
        method: 'POST',
        body: {
            periode: {
                fraOgMed: formatISO(new Date(arg.periode.fraOgMed), { representation: 'date' }),
                tilOgMed: formatISO(new Date(arg.periode.tilOgMed), { representation: 'date' }),
            },
        },
    });
}

export enum Revurderingshandling {
    SendTilAttestering = 'SEND_TIL_ATTESTERING',
    Forhåndsvarsle = 'FORHÅNDSVARSLE',
}

export async function forhåndsvarsleEllerSendTilAttestering(
    sakId: string,
    revurderingId: string,
    revurderingshandling: Revurderingshandling,
    fritekstTilBrev: string
): Promise<ApiClientResult<SimulertRevurdering, RevurderingErrorCodes>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/forhandsvarsleEllerSendTilAttestering`,
        method: 'POST',
        body: {
            revurderingshandling,
            fritekst: fritekstTilBrev,
        },
    });
}

export async function sendTilAttestering(
    sakId: string,
    revurderingId: string,
    fritekstTilBrev: string,
    skalFøreTilBrevutsending?: boolean
): Promise<ApiClientResult<RevurderingTilAttestering, RevurderingErrorCodes>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/tilAttestering`,
        method: 'POST',
        body: {
            fritekstTilBrev,
            skalFøreTilBrevutsending: skalFøreTilBrevutsending,
        },
    });
}

export async function underkjenn(
    sakId: string,
    revurderingId: string,
    grunn: UnderkjennRevurderingGrunn,
    kommentar?: string
): Promise<ApiClientResult<UnderkjentRevurdering>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/underkjenn`,
        method: 'PATCH',
        body: {
            grunn: grunn,
            kommentar: kommentar,
        },
    });
}

export async function iverksett(sakId: string, revurderingId: string): Promise<ApiClientResult<IverksattRevurdering>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/iverksett`,
        method: 'POST',
    });
}

export async function fortsettEtterForhåndsvarsel(
    sakId: string,
    revurderingId: string,
    begrunnelse: string,
    valg: BeslutningEtterForhåndsvarsling,
    fritekstTilBrev: string
): Promise<ApiClientResult<SimulertRevurdering | RevurderingTilAttestering>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/fortsettEtterForhåndsvarsel`,
        method: 'POST',
        body: {
            begrunnelse,
            valg,
            fritekstTilBrev,
        },
    });
}

export async function lagreUføregrunnlag(arg: {
    sakId: string;
    revurderingId: string;
    vurderinger: Array<{
        periode: Periode<string>;
        uføregrad: Nullable<number>;
        forventetInntekt: Nullable<number>;
        resultat: UføreResultat;
        begrunnelse: Nullable<string>;
    }>;
}) {
    return apiClient<LeggTilUføreResponse>({
        url: `/saker/${arg.sakId}/revurderinger/${arg.revurderingId}/uføregrunnlag`,
        method: 'POST',
        body: { vurderinger: arg.vurderinger },
    });
}

export async function lagreFradragsgrunnlag(
    sakId: string,
    revurderingId: string,
    fradrag: Fradrag[]
): Promise<ApiClientResult<Revurdering>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/fradrag`,
        method: 'POST',
        body: {
            fradrag: fradrag,
        },
    });
}

export async function lagreBosituasjonsgrunnlag(data: BosituasjonRequest): Promise<ApiClientResult<Revurdering>> {
    return apiClient({
        url: `/saker/${data.sakId}/revurderinger/${data.revurderingId}/bosituasjongrunnlag`,
        method: 'POST',
        body: {
            epsFnr: data.epsFnr,
            erEPSUførFlyktning: data.erEPSUførFlyktning,
            delerBolig: data.delerBolig,
            begrunnelse: data.begrunnelse,
        },
    });
}

export async function lagreFormuegrunnlag(data: FormuegrunnlagRequest): Promise<ApiClientResult<Revurdering>> {
    return apiClient({
        url: `/saker/${data.sakId}/revurderinger/${data.revurderingId}/formuegrunnlag`,
        method: 'POST',
        body: data.formue,
    });
}

export async function hentGjeldendeGrunnlagsdataOgVilkårsvurderinger(
    sakId: string,
    revurderingId: string
): Promise<ApiClientResult<GrunnlagsdataOgVilkårsvurderinger>> {
    return apiClient<GrunnlagsdataOgVilkårsvurderinger>({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/grunnlagsdataOgVilkårsvurderinger`,
        method: 'GET',
    });
}

export async function hentTidligereGrunnlagsdataForVedtak(args: {
    sakId: string;
    vedtakId: string;
}): Promise<ApiClientResult<GrunnlagsdataOgVilkårsvurderinger>> {
    return apiClient<GrunnlagsdataOgVilkårsvurderinger>({
        url: `/saker/${args.sakId}/revurderinger/historisk/vedtak/${args.vedtakId}/grunnlagsdataOgVilkårsvurderinger`,
        method: 'GET',
    });
}
