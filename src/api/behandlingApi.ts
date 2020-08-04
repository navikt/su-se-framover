import { formatISO } from 'date-fns';

import { Nullable } from '~lib/types';

import apiClient, { ApiClientResult } from './apiClient';
import { Søknad } from './søknadApi';

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

export enum Sats {
    Høy = 'HØY',
    Lav = 'LAV',
}

export enum Fradragstype {
    Uføretrygd = 'Uføretrygd',
    Barnetillegg = 'Barnetillegg',
    Arbeidsinntekt = 'Arbeidsinntekt',
    Pensjon = 'Pensjon',
    Kapitalinntekt = 'Kapitalinntekt',
    AndreYtelser = 'AndreYtelser',
}

export interface Fradrag {
    type: Fradragstype;
    beløp: number;
    beskrivelse: Nullable<string>;
}

export interface Beregning {
    id: string;
    opprettet: string;
    sats: Sats;
    fom: string;
    tom: string;
    månedsberegninger: Array<Månedsberegning>;
    fradrag: Array<Fradrag>;
}

export interface Månedsberegning {
    id: string;
    sats: Sats;
    beløp: number;
    grunnbeløp: number;
    fom: string;
    tom: string;
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
    beregning: Nullable<Beregning>;
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
        fom: Date;
        tom: Date;
        fradrag: Fradrag[];
    }
): Promise<ApiClientResult<Beregning>> {
    const { sats, fom, tom } = arg;
    return apiClient({
        url: `/saker/${sakId}/behandlinger/${behandlingId}/beregn`,
        method: 'POST',
        body: {
            sats,
            fom: formatISO(fom, { representation: 'date' }),
            tom: formatISO(tom, { representation: 'date' }),
            fradrag: arg.fradrag,
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
