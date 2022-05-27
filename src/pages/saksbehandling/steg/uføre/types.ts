import { Nullable } from '~src/lib/types';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';

export interface UføreperiodeFormData {
    id: string;
    fraOgMed: Nullable<Date>;
    tilOgMed: Nullable<Date>;
    uføregrad: string;
    forventetInntekt: string;
    oppfylt: Nullable<UføreResultat>;
}

export interface FormData {
    grunnlag: UføreperiodeFormData[];
}
