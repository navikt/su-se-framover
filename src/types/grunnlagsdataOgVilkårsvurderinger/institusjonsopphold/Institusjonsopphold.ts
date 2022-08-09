import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { Periode } from '~src/types/Periode';

export interface InstitusjonsoppholdVilkår {
    vilkår: 'INSTITUSJONSOPPHOLD';
    resultat: Vilkårstatus;
    vurderinger: VurderingsperiodeInstitusjonsopphold[];
}

export interface VurderingsperiodeInstitusjonsopphold {
    periode: Periode<string>;
    resultat: Vilkårstatus;
}

export interface InstitusjonsoppholdVurderingRequest {
    periode: Periode<string>;
    vurdering: Vilkårstatus;
}
