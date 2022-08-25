import isEqual from 'lodash.isequal';

import { Nullable } from '~src/lib/types';
import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { Periode } from '~src/types/Periode';

export interface LovligOppholdVilkår {
    vilkår: 'LOVLIG_OPPHOLD';
    resultat: Vilkårstatus;
    vurderinger: VurderingsperiodeLovligOpphold[];
}

export interface VurderingsperiodeLovligOpphold {
    periode: Periode<string>;
    resultat: Vilkårstatus;
}

export interface LovligOppholdRequest {
    sakId: string;
    behandlingId: string;
    vurderinger: LovligOppholdVurderingRequest[];
}

export interface LovligOppholdVurderingRequest {
    periode: Periode<string>;
    status: Vilkårstatus;
}

export const lovligOppholdErLik = (ny: Nullable<LovligOppholdVilkår>, gammel: Nullable<LovligOppholdVilkår>) =>
    isEqual(ny, gammel);
