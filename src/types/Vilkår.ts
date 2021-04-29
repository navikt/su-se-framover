import { Uføregrunnlag } from './Grunnlag';
import { Periode } from './Periode';

export interface Vilkårsvurderinger {
    uføre?: UføreVilkår;
}

export interface UføreVilkår {
    vilkår: string;
    vurdering: Vurderingsperiode;
    resultat: UføreResultat;
}

export interface Vurderingsperiode {
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
