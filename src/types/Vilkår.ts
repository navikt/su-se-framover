import { Uføregrunnlag } from './Grunnlag';
import { Periode } from './Periode';

export interface Vilkårsvurderinger {
    uføre?: UføreVilkår;
}

export interface UføreVilkår {
    vilkår: string;
    vurdering: Vurderingsperiode;
    oppfylt: Oppfylt;
}

export interface Vurderingsperiode {
    id: string;
    opprettet: string;
    oppfylt: Oppfylt;
    grunnlag?: Uføregrunnlag;
    periode: Periode<string>;
    begrunnelse?: string;
}

export enum Oppfylt {
    JA = 'JA',
    NEI = 'NEI',
    UAVKLART = 'UAVKLART',
}
