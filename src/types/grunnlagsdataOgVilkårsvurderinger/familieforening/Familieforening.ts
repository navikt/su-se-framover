import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { Periode } from '~src/types/Periode';

export interface Familiegjenforening {
    vilkår: 'Familiegjenforening';
    vurderinger: FamiliegjenforeningVurdering[];
    resultat: Vilkårstatus;
}

export interface FamiliegjenforeningVurdering {
    periode: Periode;
    resultat: Vilkårstatus;
}

export interface Familiegjenforeningrequest {
    sakId: string;
    behandlingId: string;
    vurderinger: Array<{ status: Vilkårstatus }>;
}
