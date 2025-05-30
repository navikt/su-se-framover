import { Nullable } from '~src/lib/types';
import yup, { validerAtNullablePeriodeErUtfylt } from '~src/lib/validering';
import { Periode } from '~src/types/Periode.ts';
import { Vilkårstatus } from '~src/types/Vilkår';
import { lagDatePeriodeAvStringPeriode, lagTomPeriode } from '~src/utils/periode/periodeUtils.ts';

export interface FamilieforeningFormData {
    familiegjenforening: FamilieforeningPeriodeFormData[];
}

export interface FamilieforeningPeriodeFormData {
    periode: {
        fraOgMed: Nullable<Date>;
        tilOgMed: Nullable<Date>;
    };
    familiegjenforening: Nullable<Vilkårstatus>;
}

export const nyVurderingsperiodeFamiliegjenforeningMedEllerUtenPeriode = (
    p?: Periode<string>,
): FamilieforeningPeriodeFormData => ({
    periode: p ? lagDatePeriodeAvStringPeriode(p) : lagTomPeriode(),
    familiegjenforening: null,
});

export const familieforeningSchema = yup.object<FamilieforeningFormData>({
    familiegjenforening: yup
        .array<FamilieforeningPeriodeFormData>(
            yup
                .object<FamilieforeningPeriodeFormData>({
                    periode: validerAtNullablePeriodeErUtfylt,
                    familiegjenforening: yup
                        .mixed()
                        .defined()
                        .oneOf(
                            [Vilkårstatus.VilkårOppfylt, Vilkårstatus.VilkårIkkeOppfylt],
                            'Du må velge om bruker har vedtak om alderspensjon',
                        ),
                })
                .required(),
        )
        .min(1)
        .required(),
});
