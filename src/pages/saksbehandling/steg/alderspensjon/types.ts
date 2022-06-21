import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import {
    PensjonsOpplysningerSvar,
    PensjonsOpplysningerUtvidetSvar,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår';

export interface FormData {
    folketrygd: Nullable<PensjonsOpplysningerSvar>;
    andreNorske: Nullable<PensjonsOpplysningerUtvidetSvar>;
    utenlandske: Nullable<PensjonsOpplysningerUtvidetSvar>;
}

export const schema = yup.object<FormData>({
    folketrygd: yup
        .mixed()
        .defined()
        .oneOf(
            [PensjonsOpplysningerUtvidetSvar.JA, PensjonsOpplysningerUtvidetSvar.NEI],
            'Du må velge om bruker har vedtak om alderspensjon'
        ),

    andreNorske: yup
        .mixed()
        .defined()
        .oneOf(
            [
                PensjonsOpplysningerUtvidetSvar.JA,
                PensjonsOpplysningerUtvidetSvar.NEI,
                PensjonsOpplysningerUtvidetSvar.IKKE_AKTUELT,
            ],
            'Du må velge om bruker har søkt andre norske pensjonstrygder'
        ),

    utenlandske: yup
        .mixed()
        .defined()
        .oneOf(
            [
                PensjonsOpplysningerUtvidetSvar.JA,
                PensjonsOpplysningerUtvidetSvar.NEI,
                PensjonsOpplysningerUtvidetSvar.IKKE_AKTUELT,
            ],
            'Du må velge om bruker har søkt andre utenlandske pensjonstrygder'
        ),
});
