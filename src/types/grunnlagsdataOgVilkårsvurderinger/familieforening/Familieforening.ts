import isEqual from 'lodash.isequal';

import { Nullable } from '~src/lib/types';
import { Periode } from '~src/types/Periode';
import { Vilkårstatus } from '~src/types/Vilkår';

export interface Familiegjenforening {
    vilkår: 'Familiegjenforening';
    vurderinger: FamiliegjenforeningVurdering[];
    resultat: Vilkårstatus;
}

export interface FamiliegjenforeningVurdering {
    periode: Periode<string>;
    resultat: Vilkårstatus;
}

export interface Familiegjenforeningrequest {
    sakId: string;
    behandlingId: string;
    vurderinger: FamiliegjenforeningPeriode[];
}

export interface FamiliegjenforeningPeriode {
    periode: Periode<string>;
    status: Vilkårstatus;
}

export const familiegjenforeningErLik = (ny: Nullable<Familiegjenforening>, gammel: Nullable<Familiegjenforening>) =>
    isEqual(ny, gammel);
