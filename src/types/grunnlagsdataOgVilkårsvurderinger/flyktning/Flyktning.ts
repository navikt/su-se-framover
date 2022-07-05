import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { Periode } from '~src/types/Periode';

export interface FlyktningVilkår {
    vilkår: 'Familiegjenforening';
    vurderinger: FlyktningVurdering[];
    resultat: Vilkårstatus;
}

export interface FlyktningVurdering {
    periode: Periode;
    resultat: Vilkårstatus;
}
