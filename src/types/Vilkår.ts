import { Fradrag } from './Fradrag';
import { Uføregrunnlag } from './Grunnlag';
import { Periode } from './Periode';

export interface GrunnlagsdataOgVilkårsvurderinger {
    uføre?: UføreVilkår;
    fradrag: Fradrag[];
}

export interface UføreVilkår {
    vilkår: string;
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
