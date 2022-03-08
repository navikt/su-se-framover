import { Nullable } from '~lib/types';
import { UføreResultat } from '~types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';

export interface UføreperiodeFormData {
    id: string;
    fraOgMed: Nullable<Date>;
    tilOgMed: Nullable<Date>;
    uføregrad: string;
    forventetInntekt: string;
    begrunnelse: Nullable<string>;
    oppfylt: Nullable<UføreResultat>;
}

export interface FormData {
    grunnlag: UføreperiodeFormData[];
}
