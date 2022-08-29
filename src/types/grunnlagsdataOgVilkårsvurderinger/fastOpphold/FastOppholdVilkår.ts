import isEqual from 'lodash.isequal';

import { Nullable } from '~src/lib/types';
import { Periode } from '~src/types/Periode';
import { Vilkårstatus } from '~src/types/Vilkår';

export interface FastOppholdVilkår {
    vilkår: 'FAST_OPPHOLD';
    resultat: Vilkårstatus;
    vurderinger: VurderingsperiodeFastOpphold[];
}

export interface VurderingsperiodeFastOpphold {
    periode: Periode<string>;
    resultat: Vilkårstatus;
}

export interface FastOppholdVilkårRequest {
    sakId: string;
    behandlingId: string;
    vurderinger: FastOppholdVurderingRequest[];
}

export interface FastOppholdVurderingRequest {
    periode: Periode<string>;
    vurdering: Vilkårstatus;
}

export const fastOppholdErLik = (ny: Nullable<FastOppholdVilkår>, gammel: Nullable<FastOppholdVilkår>) =>
    isEqual(ny, gammel);
