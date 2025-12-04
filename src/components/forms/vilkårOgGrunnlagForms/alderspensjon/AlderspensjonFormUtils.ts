import { getEq } from 'fp-ts/Array';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';

import { eqNullable, Nullable } from '~src/lib/types';
import yup, { validerAtNullablePeriodeErUtfylt } from '~src/lib/validering';
import {
    PensjonsOpplysningerSvar,
    PensjonsOpplysningerUtvidetSvar,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår';
import { Periode } from '~src/types/Periode.ts';
import { eqPeriode, lagDatePeriodeAvStringPeriode, lagTomPeriode } from '~src/utils/periode/periodeUtils.ts';

export interface AlderspensjonPeriodisertFormData {
    alderspensjon: AlderspensjonFormData[];
}

export interface AlderspensjonFormData {
    periode: {
        fraOgMed: Nullable<Date>;
        tilOgMed: Nullable<Date>;
    };
    folketrygd: Nullable<PensjonsOpplysningerSvar>;
    andreNorske: Nullable<PensjonsOpplysningerUtvidetSvar>;
    utenlandske: Nullable<PensjonsOpplysningerUtvidetSvar>;
}

export const nyVurderingsperiodeAlderspensjonMedEllerUtenPeriode = (p?: Periode<string>): AlderspensjonFormData => ({
    periode: p ? lagDatePeriodeAvStringPeriode(p) : lagTomPeriode(),
    folketrygd: null,
    andreNorske: null,
    utenlandske: null,
});

export const alderspensjonSchema = yup.object<AlderspensjonPeriodisertFormData>({
    alderspensjon: yup
        .array<AlderspensjonFormData>(
            yup
                .object<AlderspensjonFormData>({
                    periode: validerAtNullablePeriodeErUtfylt,
                    folketrygd: yup
                        .mixed()
                        .defined()
                        .oneOf(
                            [PensjonsOpplysningerUtvidetSvar.JA, PensjonsOpplysningerUtvidetSvar.NEI],
                            'Du må velge om bruker har vedtak om alderspensjon',
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
                            'Du må velge om bruker har søkt andre norske pensjonstrygder',
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
                            'Du må velge om bruker har søkt andre utenlandske pensjonstrygder',
                        ),
                })
                .required(),
        )
        .min(1)
        .required(),
});

const eqAlderspensjonFormData = struct<AlderspensjonFormData>({
    periode: eqNullable(eqPeriode),
    folketrygd: eqNullable(S.Eq),
    andreNorske: eqNullable(S.Eq),
    utenlandske: eqNullable(S.Eq),
});

export const eqAlderspensjonPeriodisertFormData = struct<AlderspensjonPeriodisertFormData>({
    alderspensjon: getEq(eqAlderspensjonFormData),
});
