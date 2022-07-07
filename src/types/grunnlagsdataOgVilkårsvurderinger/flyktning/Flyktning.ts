import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { Periode } from '~src/types/Periode';

export interface FlyktningVilkår {
    vilkår: 'FLYKTNING';
    vurderinger: VurderingsperiodeFlyktning[];
    resultat: Vilkårstatus;
}

export interface FlyktningRequest {
    periode: Periode<string>;
    vurdering: Vilkårstatus;
}

export interface VurderingsperiodeFlyktning {
    periode: Periode<string>;
    resultat: Vilkårstatus;
}
