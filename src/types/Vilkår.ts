import { Nullable } from '~lib/types';

import { Fradrag } from './Fradrag';
import { Bosituasjon, Uføregrunnlag } from './Grunnlag';
import { Periode } from './Periode';

export interface GrunnlagsdataOgVilkårsvurderinger {
    uføre: Nullable<UføreVilkår>;
    fradrag: Fradrag[];
    bosituasjon: Bosituasjon[];
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
