import { pipe } from 'fp-ts/lib/function';
import isEqual from 'lodash.isequal';

import { Nullable } from '~src/lib/types';
import { Periode } from '~src/types/Periode';

import {
    trimIdAndOpprettetFromList,
    trimIdFromObject,
    trimOpprettetFromObject,
} from '../grunnlagsdataOgVilkårsvurderinger';

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
        vurderinger: trimIdAndOpprettetFromList(
            (ny?.vurderinger ?? []).map((vurdering) => ({
                ...vurdering,
                grunnlag: pipe(vurdering.grunnlag, trimIdFromObject, trimOpprettetFromObject),
            })),
        ),
    };
    const trimmedGammel = {
        ...gammel,
        vurderinger: trimIdAndOpprettetFromList(
            (gammel?.vurderinger ?? []).map((vurdering) => ({
                ...vurdering,
                grunnlag: pipe(vurdering.grunnlag, trimIdFromObject, trimOpprettetFromObject),
            })),
        ),
    };
    return isEqual(trimmedNy, trimmedGammel);
};
