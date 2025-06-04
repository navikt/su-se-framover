import isEqual from 'lodash.isequal';

import { Nullable } from '~src/lib/types';
import { Periode } from '~src/types/Periode';
import { Vilkårstatus } from '~src/types/Vilkår';

export interface Familiegjenforening {
    vilkår: 'Familiegjenforening';
    vurderinger: FamiliegjenforeningVurdering[];
    resultat: Vilkårstatus;
}

export interface Familiegjenforeningrequest {
    sakId: string;
    behandlingId: string;
    vurderinger: FamiliegjenforeningVurdering[];
}
export interface FamiliegjenforeningVurdering {
    periode: Periode<string>;
    resultat: Vilkårstatus;
}

export const familiegjenforeningErLik = (ny: Nullable<Familiegjenforening>, gammel: Nullable<Familiegjenforening>) =>
    isEqual(ny, gammel);
