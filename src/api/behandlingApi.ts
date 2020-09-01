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
    fradrag: number;
}

export interface Vilkårsvurdering {
    id: string;
    begrunnelse: string;
    status: VilkårVurderingStatus;
}

export type Vilkårsvurderinger = {
    [key in Vilkårtype]: Vilkårsvurdering;
};

export interface Behandling {
    id: string;
    søknad: Søknad;
    vilkårsvurderinger: Vilkårsvurderinger;
    beregning: Nullable<Beregning>;
    status: Behandlingsstatus;
    utbetaling: Nullable<Utbetaling>;
    opprettet: string;
}

export enum Behandlingsstatus {
    OPPRETTET = 'OPPRETTET',
    BEREGNET = 'BEREGNET',
    SIMULERT = 'SIMULERT',
    /*VEDTAKSBREV = 'VEDTAKSBREV',*/
    INNVILGET = 'INNVILGET',
    AVSLÅTT = 'AVSLÅTT',
}

export interface Utbetaling {
    id: string;
    opprettet: string;
    simulering: Simulering;
}

export interface Simulering {
    totalBruttoYtelse: number;
    perioder: SimulertPeriode[];
}

export interface SimulertPeriode {
    fom: string;
    tom: string;
    bruttoYtelse: number;
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
): Promise<ApiClientResult<Behandling>> {
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

// Denne vil kanskje på sikt låse behandlingen også.
export async function simulerBehandling(sakId: string, behandlingId: string): Promise<ApiClientResult<Behandling>> {
    return apiClient({
        url: `/saker/${sakId}/behandlinger/${behandlingId}/simuler`,
        method: 'POST',
    });
}

export async function sendTilAttestering(arg: { sakId: string; behandlingId: string }) {
    return apiClient<Behandling>({
        url: `/saker/${arg.sakId}/behandlinger/${arg.behandlingId}/tilAttestering`,
        method: 'POST',
    });
}
