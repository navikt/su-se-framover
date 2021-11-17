import { Nullable } from '~lib/types';
import { Fradrag } from '~types/Fradrag';

import { Bosituasjon } from './bosituasjon/Bosituasjongrunnlag';
import { FormueVilkår } from './formue/Formuevilkår';
import { UføreVilkår } from './uføre/Uførevilkår';
import { Utenlandsopphold } from './utenlandsopphold/Utenlandsopphold';

export interface GrunnlagsdataOgVilkårsvurderinger {
    uføre: Nullable<UføreVilkår>;
    fradrag: Fradrag[];
    bosituasjon: Bosituasjon[];
    formue: FormueVilkår;
    utenlandsopphold: Utenlandsopphold;
}
