import { Periode } from '~types/Periode';

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
    grunnlag?: Uføregrunnlag;
    periode: Periode<string>;
    begrunnelse?: string;
}

export enum UføreResultat {
    VilkårOppfylt = 'VilkårOppfylt',
    VilkårIkkeOppfylt = 'VilkårIkkeOppfylt',
    HarUføresakTilBehandling = 'HarUføresakTilBehandling',
}
