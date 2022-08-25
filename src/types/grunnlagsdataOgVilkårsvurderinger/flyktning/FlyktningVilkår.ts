import isEqual from 'lodash.isequal';

import { Nullable } from '~src/lib/types';
import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { Periode } from '~src/types/Periode';

export interface FlyktningVilkår {
    vilkår: 'FLYKTNING';
    vurderinger: VurderingsperiodeFlyktning[];
    resultat: Vilkårstatus;
}

export interface VurderingsperiodeFlyktning {
    periode: Periode<string>;
    resultat: Vilkårstatus;
}

export interface FlyktningVilkårRequest {
    sakId: string;
    behandlingId: string;
    vurderinger: FlyktningVurderingrequest[];
}

export interface FlyktningVurderingrequest {
    periode: Periode<string>;
    vurdering: Vilkårstatus;
}

export const flyktningErLik = (ny: Nullable<FlyktningVilkår>, gammel: Nullable<FlyktningVilkår>) => isEqual(ny, gammel);
