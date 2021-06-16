import { Nullable } from '~lib/types';

import { Fradrag } from './Fradrag';
import { Bosituasjon, Formuegrunnlag, Uføregrunnlag } from './Grunnlag';
import { Periode } from './Periode';

export interface GrunnlagsdataOgVilkårsvurderinger {
    uføre: Nullable<UføreVilkår>;
    fradrag: Fradrag[];
    bosituasjon: Bosituasjon[];
    formue: FormueVilkår;
}

export interface UføreVilkår {
    vilkår: 'Uførhet';
    vurderinger: VurderingsperiodeUføre[];
    resultat: UføreResultat;
}

export interface Formuegrenser {
    gyldigFra: string;
    beløp: number;
}

export interface FormueVilkår {
    formuegrenser: Formuegrenser[];
    //TODO: fiks backend  - og bruk riktig resultat type
    resultat: UføreResultat;
    vurderinger: VurderingsperiodeFormue[];
    vilkår: 'Formue';
}

export interface VurderingsperiodeUføre {
    id: string;
    opprettet: string;
    resultat: UføreResultat;
    grunnlag?: Uføregrunnlag;
    periode: Periode<string>;
    begrunnelse?: string;
}

export interface VurderingsperiodeFormue {
    id: string;
    opprettet: string;
    //TODO: riktig resultat type
    resultat: UføreResultat;
    grunnlag?: Formuegrunnlag;
    periode: Periode<string>;
    begrunnelse?: string;
}

export enum UføreResultat {
    VilkårOppfylt = 'VilkårOppfylt',
    VilkårIkkeOppfylt = 'VilkårIkkeOppfylt',
    HarUføresakTilBehandling = 'HarUføresakTilBehandling',
}
