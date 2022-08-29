import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { Vilkårstatus } from '~src/types/Vilkår';

export interface FormData {
    familieforening: Nullable<Vilkårstatus>;
}

export const schema = yup.object<FormData>({
    familieforening: yup
        .mixed()
        .defined()
        .oneOf(
            [Vilkårstatus.VilkårOppfylt, Vilkårstatus.VilkårIkkeOppfylt],
            'Du må velge om bruker har vedtak om alderspensjon'
        ),
});
