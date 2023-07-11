import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { Vilkårstatus } from '~src/types/Vilkår';

export interface FamilieforeningFormData {
    familieforening: Nullable<Vilkårstatus>;
}

export const familieforeningSchema = yup.object<FamilieforeningFormData>({
    familieforening: yup
        .mixed()
        .defined()
        .oneOf(
            [Vilkårstatus.VilkårOppfylt, Vilkårstatus.VilkårIkkeOppfylt],
            'Du må velge om bruker har vedtak om alderspensjon',
        ),
});
