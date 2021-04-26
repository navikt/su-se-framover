import { Grunnlag } from './Grunnlag';
import { Periode } from './Periode';

export interface Vilkårsvurderinger {
    uføre?: UføreVilkår;
}

export interface UføreVilkår {
    vilkår: string;
    vurdering?: Vurderingsperiode;
    resultat: string;
}

export interface Vurderingsperiode {
    id: string;
    opprettet: string;
    resultat: Vurderingsresultat;
    grunnlag?: Grunnlag;
    periode: Periode<string>;
    begrunnelse?: string;
}

enum Vurderingsresultat {
    AVSLAG,
    INNVILGET,
}
