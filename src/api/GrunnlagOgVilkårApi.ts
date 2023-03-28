import { Fradragsgrunnlagrequest } from '~src/types/Fradrag';
import { AlderspensjonVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår';
import {
    BosituasjongrunnlagRequest,
    BosituasjonRequest,
    FullstendigBosituasjonRequest,
    UfullstendigBosituasjonRequest,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { Familiegjenforeningrequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/familieforening/Familieforening';
import { FastOppholdVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/fastOpphold/FastOppholdVilkår';
import { FlyktningVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/flyktning/FlyktningVilkår';
import { FormueVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { InstitusjonsoppholdVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/institusjonsopphold/Institusjonsopphold';
import { LovligOppholdRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/lovligOpphold/LovligOppholdVilkår';
import { OpplysningspliktRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/opplysningsplikt/Opplysningsplikt';
import { PersonligOppmøteVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/personligOppmøte/PersonligOppmøteVilkår';
import { UførevilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { UtenlandsoppholdRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { InformasjonsRevurdering, OpprettetRevurdering } from '~src/types/Revurdering';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';

import apiClient, { ErrorMessage } from './apiClient';

export enum Behandlingstype {
    Søknadsbehandling = 'Søknadsbehandling',
    Revurdering = 'Revurdering',
}

export type VilkårOgGrunnlagApiResult<T extends InformasjonsRevurdering = InformasjonsRevurdering> =
    | Søknadsbehandling
    | RevurderingOgFeilmeldinger<T>;

export type RevurderingOgFeilmeldinger<T extends InformasjonsRevurdering = InformasjonsRevurdering> = {
    revurdering: T;
    feilmeldinger: ErrorMessage[];
    varselmeldinger: ErrorMessage[];
};

export type BehandlingstypeMedApiRequest<T> = T & { behandlingstype: Behandlingstype };

const mapBehandlingstypeTilBaseUrl = (sakId: string, behandlingId: string, b: Behandlingstype) => {
    switch (b) {
        case Behandlingstype.Søknadsbehandling:
            return `/saker/${sakId}/behandlinger/${behandlingId}`;
        case Behandlingstype.Revurdering:
            return `/saker/${sakId}/revurderinger/${behandlingId}`;
    }
};

export async function lagreUføregrunnlag(arg: BehandlingstypeMedApiRequest<UførevilkårRequest>) {
    return apiClient<VilkårOgGrunnlagApiResult<OpprettetRevurdering>>({
        url: `${mapBehandlingstypeTilBaseUrl(arg.sakId, arg.behandlingId, arg.behandlingstype)}/uføregrunnlag`,
        method: 'POST',
        body: { vurderinger: arg.vurderinger },
    });
}

export async function lagreAldersgrunnlag(arg: AlderspensjonVilkårRequest) {
    return apiClient<Søknadsbehandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/pensjon`,
        method: 'POST',
        body: arg.vurderinger,
    });
}

export async function lagreFamilieforeningsgrunnlag(arg: Familiegjenforeningrequest) {
    return apiClient<Søknadsbehandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/familiegjenforening`,
        method: 'POST',
        body: { vurderinger: arg.vurderinger },
    });
}

export async function lagreFlyktningVilkår(arg: BehandlingstypeMedApiRequest<FlyktningVilkårRequest>) {
    return apiClient<VilkårOgGrunnlagApiResult>({
        url: `${mapBehandlingstypeTilBaseUrl(arg.sakId, arg.behandlingId, arg.behandlingstype)}/flyktning`,
        method: 'POST',
        body: arg.vurderinger,
    });
}

export async function lagreLovligOppholdVilkår(arg: BehandlingstypeMedApiRequest<LovligOppholdRequest>) {
    return apiClient<VilkårOgGrunnlagApiResult>({
        url: `${mapBehandlingstypeTilBaseUrl(arg.sakId, arg.behandlingId, arg.behandlingstype)}/lovligopphold`,
        method: 'POST',
        body: { vurderinger: arg.vurderinger },
    });
}

export async function lagreFastOppholdVilkår(arg: BehandlingstypeMedApiRequest<FastOppholdVilkårRequest>) {
    return apiClient<VilkårOgGrunnlagApiResult>({
        url: `${mapBehandlingstypeTilBaseUrl(arg.sakId, arg.behandlingId, arg.behandlingstype)}/fastopphold`,
        method: 'POST',
        body: arg.vurderinger,
    });
}

export async function lagreInstitusjonsoppholdVilkår(
    arg: BehandlingstypeMedApiRequest<InstitusjonsoppholdVilkårRequest>
) {
    return apiClient<VilkårOgGrunnlagApiResult>({
        url: `${mapBehandlingstypeTilBaseUrl(arg.sakId, arg.behandlingId, arg.behandlingstype)}/institusjonsopphold`,
        method: 'POST',
        body: { vurderingsperioder: arg.vurderingsperioder },
    });
}

export async function lagreUtenlandsopphold(arg: BehandlingstypeMedApiRequest<UtenlandsoppholdRequest>) {
    return apiClient<VilkårOgGrunnlagApiResult>({
        url: `${mapBehandlingstypeTilBaseUrl(arg.sakId, arg.behandlingId, arg.behandlingstype)}/utenlandsopphold`,
        method: 'POST',
        body: { vurderinger: arg.utenlandsopphold },
    });
}

export const lagreBosituasjon = async (arg: BehandlingstypeMedApiRequest<BosituasjongrunnlagRequest>) => {
    return apiClient<Søknadsbehandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/grunnlag/bosituasjon`,
        method: 'POST',
        body: arg.vurderinger,
    });
};

export async function lagreUfullstendigBosituasjon(arg: UfullstendigBosituasjonRequest) {
    return apiClient<Søknadsbehandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/grunnlag/bosituasjon/eps`,
        method: 'POST',
        body: { epsFnr: arg.epsFnr },
    });
}

export async function lagreFormuegrunnlag(arg: BehandlingstypeMedApiRequest<FormueVilkårRequest>) {
    return apiClient<VilkårOgGrunnlagApiResult>({
        url: `${mapBehandlingstypeTilBaseUrl(arg.sakId, arg.behandlingId, arg.behandlingstype)}/formuegrunnlag`,
        method: 'POST',
        body: arg.vurderinger,
    });
}

export async function lagrePersonligOppmøteVilkår(arg: BehandlingstypeMedApiRequest<PersonligOppmøteVilkårRequest>) {
    return apiClient<VilkårOgGrunnlagApiResult>({
        url: `${mapBehandlingstypeTilBaseUrl(arg.sakId, arg.behandlingId, arg.behandlingstype)}/personligoppmøte`,
        method: 'POST',
        body: arg.vurderinger,
    });
}

export async function lagreFullstendigBosituasjon(arg: FullstendigBosituasjonRequest) {
    return apiClient<Søknadsbehandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/grunnlag/bosituasjon/fullfør`,
        method: 'POST',
        body: { bosituasjon: arg.bosituasjon },
    });
}

export async function lagreFradragsgrunnlag(arg: BehandlingstypeMedApiRequest<Fradragsgrunnlagrequest>) {
    return apiClient<VilkårOgGrunnlagApiResult>({
        url: `${mapBehandlingstypeTilBaseUrl(arg.sakId, arg.behandlingId, arg.behandlingstype)}/fradrag`,
        method: 'POST',
        body: { fradrag: arg.fradrag },
    });
}

export async function lagreBosituasjonsgrunnlag(data: BosituasjonRequest) {
    return apiClient<RevurderingOgFeilmeldinger>({
        url: `/saker/${data.sakId}/revurderinger/${data.revurderingId}/bosituasjongrunnlag`,
        method: 'POST',
        body: data,
    });
}

export async function lagreOpplysningsplikt(data: OpplysningspliktRequest) {
    return apiClient<RevurderingOgFeilmeldinger>({
        url: `/vilkar/opplysningsplikt`,
        method: 'POST',
        body: {
            id: data.behandlingId,
            type: data.type,
            data: data.data,
        },
    });
}

export async function hentgjeldendeGrunnlagsdataOgVilkårsvurderinger(arg: {
    sakId: string;
    fraOgMed: string;
    tilOgMed: string;
}) {
    return apiClient<{ grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger }>({
        url: `/saker/${arg.sakId}/gjeldendeVedtaksdata`,
        method: 'POST',
        body: {
            fraOgMed: arg.fraOgMed,
            tilOgMed: arg.tilOgMed,
        },
    });
}
