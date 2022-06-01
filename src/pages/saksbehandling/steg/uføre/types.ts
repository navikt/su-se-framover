import { Nullable } from '~src/lib/types';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { NullablePeriode } from '~src/types/Periode';

export interface UføreperiodeFormData {
    id: string;
    periode: NullablePeriode;
    uføregrad: string;
    forventetInntekt: string;
    oppfylt: Nullable<UføreResultat>;
}

export interface FormData {
    grunnlag: UføreperiodeFormData[];
}
