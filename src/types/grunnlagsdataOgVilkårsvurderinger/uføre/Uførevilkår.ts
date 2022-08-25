import isEqual from 'lodash.isequal';

import { Nullable } from '~src/lib/types';
import { Periode } from '~src/types/Periode';

import { trimIdFromList, trimIdFromObject } from '../grunnlagsdataOgVilkårsvurderinger';

import { Uføregrunnlag } from './Uføregrunnlag';

export interface UføreVilkår {
    vilkår: 'Uførhet';
    vurderinger: VurderingsperiodeUføre[];
    resultat: UføreResultat;
}

export interface VurderingsperiodeUføre {
    id: string;
    opprettet: string;
    resultat: UføreResultat;
    grunnlag: Nullable<Uføregrunnlag>;
    periode: Periode<string>;
}

export enum UføreResultat {
    VilkårOppfylt = 'VilkårOppfylt',
    VilkårIkkeOppfylt = 'VilkårIkkeOppfylt',
    HarUføresakTilBehandling = 'HarUføresakTilBehandling',
}

export interface UførevilkårRequest {
    sakId: string;
    behandlingId: string;
    vurderinger: UføreVurderingsperiodeRequest[];
}

export interface UføreVurderingsperiodeRequest {
    periode: Periode<string>;
    uføregrad: Nullable<number>;
    forventetInntekt: Nullable<number>;
    resultat: UføreResultat;
}

export const uføreErlik = (ny: Nullable<UføreVilkår>, gammel: Nullable<UføreVilkår>) => {
    const trimmedNy = {
        ...ny,
        vurderinger: trimIdFromList(
            (ny?.vurderinger ?? []).map((vurdering) => ({
                ...vurdering,
                grunnlag: trimIdFromObject(vurdering.grunnlag),
            }))
        ),
    };
    const trimmedGammel = {
        ...gammel,
        vurderinger: trimIdFromList(
            (gammel?.vurderinger ?? []).map((vurdering) => ({
                ...vurdering,
                grunnlag: trimIdFromObject(vurdering.grunnlag),
            }))
        ),
    };
    return isEqual(trimmedNy, trimmedGammel);
};
