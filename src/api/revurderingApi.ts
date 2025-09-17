import { formatISO } from 'date-fns';

import { Nullable } from '~src/lib/types';
import { Brevvalg } from '~src/pages/saksbehandling/avsluttBehandling/avsluttRevurdering/avsluttRevurderingUtils';
import { UnderkjennelseGrunnBehandling } from '~src/types/Behandling';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import {
    Gjenopptak,
    IverksattRevurdering,
    OppdaterRevurderingRequest,
    OpprettetRevurdering,
    OpprettetRevurderingGrunn,
    OpprettRevurderingRequest,
    Revurdering,
    RevurderingTilAttestering,
    SimulertRevurdering,
    StansAvYtelse,
    UnderkjentRevurdering,
    Valg,
} from '~src/types/Revurdering';

import apiClient, { ApiClientResult, ErrorMessage } from './apiClient';

export async function opprettRevurdering(
    arg: OpprettRevurderingRequest,
): Promise<ApiClientResult<OpprettetRevurdering>> {
    return apiClient({
        url: `/saker/${arg.sakId}/revurderinger`,
        method: 'POST',
        body: {
            fraOgMed: formatISO(arg.periode.fraOgMed, { representation: 'date' }),
            tilOgMed: formatISO(arg.periode.tilOgMed, { representation: 'date' }),
            årsak: arg.årsak,
            omgjøringsgrunn: arg.omgjøringsgrunn,
            informasjonSomRevurderes: arg.informasjonSomRevurderes,
            begrunnelse: arg.begrunnelse,
        },
    });
}

export async function opprettStans(args: {
    sakId: string;
    fraOgMed: Date;
    årsak: OpprettetRevurderingGrunn;
    begrunnelse: string;
}): Promise<ApiClientResult<StansAvYtelse>> {
    return apiClient({
        url: `/saker/${args.sakId}/revurderinger/stans`,
        method: 'POST',
        body: {
            fraOgMed: formatISO(args.fraOgMed, { representation: 'date' }),
            årsak: args.årsak,
            begrunnelse: args.begrunnelse,
        },
    });
}

export async function oppdaterStans(args: {
    sakId: string;
    revurderingId: string;
    fraOgMed: Date;
    årsak: OpprettetRevurderingGrunn;
    begrunnelse: string;
}): Promise<ApiClientResult<StansAvYtelse>> {
    return apiClient({
        url: `/saker/${args.sakId}/revurderinger/stans/${args.revurderingId}`,
        method: 'PATCH',
        body: {
            fraOgMed: formatISO(args.fraOgMed, { representation: 'date' }),
            årsak: args.årsak,
            begrunnelse: args.begrunnelse,
        },
    });
}

export async function gjenoppta(args: {
    sakId: string;
    årsak: OpprettetRevurderingGrunn;
    begrunnelse: string;
}): Promise<ApiClientResult<Gjenopptak>> {
    return apiClient({
        url: `/saker/${args.sakId}/revurderinger/gjenoppta`,
        method: 'POST',
        body: {
            årsak: args.årsak,
            begrunnelse: args.begrunnelse,
        },
    });
}

export async function oppdaterGjenopptak(args: {
    sakId: string;
    revurderingId: string;
    årsak: OpprettetRevurderingGrunn;
    begrunnelse: string;
}): Promise<ApiClientResult<Gjenopptak>> {
    return apiClient({
        url: `/saker/${args.sakId}/revurderinger/gjenoppta/${args.revurderingId}`,
        method: 'PATCH',
        body: {
            årsak: args.årsak,
            begrunnelse: args.begrunnelse,
        },
    });
}

export async function iverksettGjenopptak(args: {
    sakId: string;
    revurderingId: string;
}): Promise<ApiClientResult<Gjenopptak>> {
    return apiClient({
        url: `/saker/${args.sakId}/revurderinger/gjenoppta/${args.revurderingId}/iverksett`,
        method: 'POST',
    });
}

export async function iverksettStans(args: {
    sakId: string;
    revurderingId: string;
}): Promise<ApiClientResult<StansAvYtelse>> {
    return apiClient({
        url: `/saker/${args.sakId}/revurderinger/stans/${args.revurderingId}/iverksett`,
        method: 'POST',
    });
}

export async function oppdaterRevurdering(
    arg: OppdaterRevurderingRequest,
): Promise<ApiClientResult<OpprettetRevurdering>> {
    return apiClient({
        url: `/saker/${arg.sakId}/revurderinger/${arg.revurderingId}`,
        method: 'PUT',
        body: {
            fraOgMed: formatISO(arg.periode.fraOgMed, { representation: 'date' }),
            tilOgMed: formatISO(arg.periode.tilOgMed, { representation: 'date' }),
            årsak: arg.årsak,
            informasjonSomRevurderes: arg.informasjonSomRevurderes,
            begrunnelse: arg.begrunnelse,
            omgjøringsgrunn: arg.omgjøringsgrunn,
        },
    });
}

export type BeregnOgSimuler = {
    revurdering: SimulertRevurdering;
    feilmeldinger: ErrorMessage[];
    varselmeldinger: ErrorMessage[];
};

export async function beregnOgSimuler(arg: {
    sakId: string;
    revurderingId: string;
}): Promise<ApiClientResult<BeregnOgSimuler>> {
    return apiClient({
        url: `/saker/${arg.sakId}/revurderinger/${arg.revurderingId}/beregnOgSimuler`,
        method: 'POST',
    });
}

export async function lagreForhåndsvarsel(
    sakId: string,
    revurderingId: string,
    fritekstTilBrev: string,
): Promise<ApiClientResult<SimulertRevurdering>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/forhandsvarsel`,
        method: 'POST',
        body: {
            fritekst: fritekstTilBrev,
        },
    });
}

export async function lagreBrevvalg(
    sakId: string,
    revurderingId: string,
    valg: Valg,
    fritekst: Nullable<string>,
    begrunnelse: Nullable<string>,
): Promise<ApiClientResult<SimulertRevurdering>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/brevvalg`,
        method: 'POST',
        body: {
            valg: valg,
            fritekst: fritekst,
            begrunnelse: begrunnelse,
        },
    });
}

export async function sendTilAttestering(
    sakId: string,
    revurderingId: string,
): Promise<ApiClientResult<RevurderingTilAttestering>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/tilAttestering`,
        method: 'POST',
    });
}

export async function underkjenn(
    sakId: string,
    revurderingId: string,
    grunn: UnderkjennelseGrunnBehandling,
    kommentar?: string,
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
export async function returnerRevurdering(arg: { sakId: string; revurderingId: string }) {
    return apiClient<Revurdering>({
        url: `/saker/${arg.sakId}/revurderinger/${arg.revurderingId}/returnerRevurdering`,
        method: 'PATCH',
    });
}

export async function iverksett(sakId: string, revurderingId: string): Promise<ApiClientResult<IverksattRevurdering>> {
    return apiClient({
        url: `/saker/${sakId}/revurderinger/${revurderingId}/iverksett`,
        method: 'POST',
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

export async function avsluttRevurdering(args: {
    sakId: string;
    revurderingId: string;
    begrunnelse: string;
    fritekst: Nullable<string>;
    brevvalg: Nullable<Brevvalg>;
}): Promise<ApiClientResult<Revurdering>> {
    return apiClient<Revurdering>({
        url: `/saker/${args.sakId}/revurderinger/${args.revurderingId}/avslutt`,
        method: 'POST',
        body: {
            begrunnelse: args.begrunnelse,
            fritekst: args.fritekst,
            brevvalg: args.brevvalg,
        },
    });
}
