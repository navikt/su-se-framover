import apiClient, { ApiClientResult } from './apiClient';

export enum VilkårVurderingStatus {
    IkkeVurdert = 'IKKE_VURDERT',
    Ok = 'OK',
    IkkeOk = 'IKKE_OK',
}

export enum Vilkårtype {
    Uførhet = 'UFØRHET',
    Flyktning = 'FLYKTNING',
    Oppholdstillatelse = 'OPPHOLDSTILLATELSE',
    PersonligOppmøte = 'PERSONLIG_OPPMØTE',
    Formue = 'FORMUE',
    BorOgOppholderSegINorge = 'BOR_OG_OPPHOLDER_SEG_I_NORGE',
}

export interface Vilkårsvurdering {
    id: string;
    begrunnelse: string;
    status: VilkårVurderingStatus;
}

export interface Behandling {
    id: number;
    vilkårsvurderinger: {
        [key in Vilkårtype]: Vilkårsvurdering;
    };
}

export async function startBehandling(sakId: string, stønadsperiodeId: string): Promise<ApiClientResult<Behandling>> {
    return apiClient(`/sak/${sakId}/stonadsperioder/${stønadsperiodeId}/behandlinger`, {
        method: 'POST',
    });
}

export async function hentBehandling(
    sakId: string,
    stønadsperiodeId: string,
    behandlingId: string
): Promise<ApiClientResult<Behandling>> {
    return apiClient(`/sak/${sakId}/stonadsperioder/${stønadsperiodeId}/behandlinger/${behandlingId}`, {
        method: 'GET',
    });
}
