import apiClient, { ApiClientResult } from './apiClient';
import { Søknad } from './søknadApi';
import { Sats } from '../pages/saksoversikt/beregning/Beregning';

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
    id: string;
    søknad: Søknad;
    vilkårsvurderinger: {
        [key in Vilkårtype]: Vilkårsvurdering;
    };
}

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
        sats: Sats;
        startDato: string;
        slutDato: string;
    }
) {
    const { sats, startDato, slutDato } = arg;
    return apiClient({
        url: `/saker/${sakId}/behandlinger/${behandlingId}/beregning`,
        method: 'POST',
        body: {
            sats,
            startDato,
            slutDato,
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
