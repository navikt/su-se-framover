import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';

export interface Familieforening {
    vilkår: 'Familieforening';
    vurderinger: {
        familieforening: Vilkårstatus;
    };
    resultat: Vilkårstatus;
}
