import { Uføregrunnlag } from './Grunnlag';
import { Periode } from './Periode';

export interface Vilkårsvurderinger {
    uføre?: UføreVilkår;
}

export interface UføreVilkår {
    vilkår: string;
    vurdering: Vurderingsperiode;
    resultat: Vurderingsresultat;
}

export interface Vurderingsperiode {
    id: string;
    opprettet: string;
    resultat: Vurderingsresultat;
    grunnlag?: Uføregrunnlag;
    periode: Periode<string>;
    begrunnelse?: string;
}

export enum Vurderingsresultat {
    VilkårOppfylt = 'VilkårOppfylt',
    VilkårIkkeOppfylt = 'VilkårIkkeOppfylt',
    HarUføresakTilBehandling = 'HarUføresakTilBehandling',
}
