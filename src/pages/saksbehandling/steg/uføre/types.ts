import { Nullable } from '~lib/types';

export interface UføreperiodeFormData {
    id: string;
    fraOgMed: Nullable<Date>;
    tilOgMed: Nullable<Date>;
    uføregrad: string;
    forventetInntekt: string;
    oppfylt: Nullable<boolean>;
}

export interface FormData {
    grunnlag: UføreperiodeFormData[];
}
