import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { Aldersresultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår';

export interface FormData {
    harSøktAlderspensjon: Nullable<Aldersresultat>;
}

export const schema = yup.object<FormData>({
    harSøktAlderspensjon: yup
        .mixed()
        .defined()
        .oneOf(
            [Aldersresultat.VilkårOppfylt, Aldersresultat.VilkårIkkeOppfylt, Aldersresultat.HarAlderssakTilBehandling],
            'Du må velge om bruker har vedtak om alderspensjon'
        ),
});
