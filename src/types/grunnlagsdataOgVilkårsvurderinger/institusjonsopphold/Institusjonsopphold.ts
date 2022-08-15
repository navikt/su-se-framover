import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { Periode } from '~src/types/Periode';

export interface InstitusjonsoppholdVilkår {
    vilkår: 'INSTITUSJONSOPPHOLD';
    resultat: Vilkårstatus;
    vurderingsperioder: VurderingsperiodeInstitusjonsopphold[];
}

export interface VurderingsperiodeInstitusjonsopphold {
    periode: Periode<string>;
    vurdering: Vilkårstatus;
}

export interface InstitusjonsoppholdVurderingRequest {
    periode: Periode<string>;
    vurdering: Vilkårstatus;
}
