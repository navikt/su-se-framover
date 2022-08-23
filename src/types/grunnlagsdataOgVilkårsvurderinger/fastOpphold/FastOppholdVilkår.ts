import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { Periode } from '~src/types/Periode';

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
