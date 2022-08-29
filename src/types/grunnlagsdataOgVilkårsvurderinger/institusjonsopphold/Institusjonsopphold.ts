import isEqual from 'lodash.isequal';

import { Nullable } from '~src/lib/types';
import { Periode } from '~src/types/Periode';
import { Vilkårstatus } from '~src/types/Vilkår';

export interface InstitusjonsoppholdVilkår {
    vilkår: 'INSTITUSJONSOPPHOLD';
    resultat: Vilkårstatus;
    vurderingsperioder: VurderingsperiodeInstitusjonsopphold[];
}

export interface VurderingsperiodeInstitusjonsopphold {
    periode: Periode<string>;
    vurdering: Vilkårstatus;
}

export interface InstitusjonsoppholdVilkårRequest {
    sakId: string;
    behandlingId: string;
    vurderingsperioder: InstitusjonsoppholdVurderingRequest[];
}

export interface InstitusjonsoppholdVurderingRequest {
    periode: Periode<string>;
    vurdering: Vilkårstatus;
}

export const institusjonsoppholdErLik = (
    ny: Nullable<InstitusjonsoppholdVilkår>,
    gammel: Nullable<InstitusjonsoppholdVilkår>
) => isEqual(ny, gammel);
