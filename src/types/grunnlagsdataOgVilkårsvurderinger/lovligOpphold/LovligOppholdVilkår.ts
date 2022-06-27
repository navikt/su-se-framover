import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';

import { LovligOppholdGrunnlag } from './LovligOppholdGrunnlag';

export interface LovligOppholdVilkår {
    vilkår: 'LOVLIG_OPPHOLD';
    resultat: Vilkårstatus;
    vurderinger: LovligOppholdGrunnlag[];
}
