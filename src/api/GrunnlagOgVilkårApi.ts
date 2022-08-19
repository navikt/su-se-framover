import { FastOppholdVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/fastOpphold/FastOppholdVilkår';
import { FlyktningVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/flyktning/FlyktningVilkår';
import { InstitusjonsoppholdVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/institusjonsopphold/Institusjonsopphold';
import { LovligOppholdRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/lovligOpphold/LovligOppholdVilkår';
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
};

const mapBehandlingstypeTilriktigUrl = (sakId: string, behandlingId: string, b: Behandlingstype) => {
    switch (b) {
        case Behandlingstype.Søknadsbehandling:
            return `/saker/${sakId}/behandlinger/${behandlingId}`;
        case Behandlingstype.Revurdering:
            return `/saker/${sakId}/revurderinger/${behandlingId}`;
    }
};

export async function lagreUføregrunnlag(arg: UførevilkårRequest & { behandlingstype: Behandlingstype }) {
    return apiClient<VilkårOgGrunnlagApiResult<OpprettetRevurdering>>({
        url: `${mapBehandlingstypeTilriktigUrl(arg.sakId, arg.behandlingId, arg.behandlingstype)}/uføregrunnlag`,
        method: 'POST',
        body: { vurderinger: arg.vurderinger },
    });
}

export async function lagreFlyktningVilkår(arg: FlyktningVilkårRequest & { behandlingstype: Behandlingstype }) {
    return apiClient<VilkårOgGrunnlagApiResult>({
        url: `${mapBehandlingstypeTilriktigUrl(arg.sakId, arg.behandlingId, arg.behandlingstype)}/flyktning`,
        method: 'POST',
        body: arg.vurderinger,
    });
}

export async function lagreLovligOppholdVilkår(arg: LovligOppholdRequest & { behandlingstype: Behandlingstype }) {
    return apiClient<VilkårOgGrunnlagApiResult>({
        url: `${mapBehandlingstypeTilriktigUrl(arg.sakId, arg.behandlingId, arg.behandlingstype)}/lovligopphold`,
        method: 'POST',
        body: { vurderinger: arg.vurderinger },
    });
}

export async function lagreFastOppholdVilkår(arg: FastOppholdVilkårRequest & { behandlingstype: Behandlingstype }) {
    return apiClient<VilkårOgGrunnlagApiResult>({
        url: `${mapBehandlingstypeTilriktigUrl(arg.sakId, arg.behandlingId, arg.behandlingstype)}/fastopphold`,
        method: 'POST',
        body: arg.vurderinger,
    });
}

export async function lagreInstitusjonsoppholdVilkår(
    arg: InstitusjonsoppholdVilkårRequest & { behandlingstype: Behandlingstype }
) {
    return apiClient<VilkårOgGrunnlagApiResult>({
        url: `${mapBehandlingstypeTilriktigUrl(arg.sakId, arg.behandlingId, arg.behandlingstype)}/institusjonsopphold`,
        method: 'POST',
        body: { vurderingsperioder: arg.vurderingsperioder },
    });
}

export async function lagreUtenlandsopphold(arg: UtenlandsoppholdRequest & { behandlingstype: Behandlingstype }) {
    return apiClient<VilkårOgGrunnlagApiResult>({
        url: `${mapBehandlingstypeTilriktigUrl(arg.sakId, arg.behandlingId, arg.behandlingstype)}/utenlandsopphold`,
        method: 'POST',
        body: { vurderinger: arg.utenlandsopphold },
    });
}

/*
TODO - Formue trenger litt mer arbeid
export async function lagreFormuegrunnlag(arg: FormuegrunnlagRequest & { behandlingstype: Behandlingstype }) {
    return apiClient<VilkårOgGrunnlagApiResult>({
        url: `${mapBehandlingstypeTilriktigUrl(arg.sakId, arg.behandlingId, arg.behandlingstype)}/formuegrunnlag`,
        method: 'POST',
        body: { formue: arg.formue },
    });
}
*/

export async function lagrePersonligOppmøteVilkår(
    arg: PersonligOppmøteVilkårRequest & { behandlingstype: Behandlingstype }
) {
    return apiClient<VilkårOgGrunnlagApiResult>({
        url: `${mapBehandlingstypeTilriktigUrl(arg.sakId, arg.behandlingId, arg.behandlingstype)}/personligoppmøte`,
        method: 'POST',
        body: arg.vurderinger,
    });
}
