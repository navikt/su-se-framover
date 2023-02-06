import * as DateFns from 'date-fns';
import * as D from 'fp-ts/lib/Date';
import { struct } from 'fp-ts/lib/Eq';

import { eqNullable, Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';

export interface VirkningstidspunktFormData {
    fraOgMed: Nullable<Date>;
    tilOgMed: Nullable<Date>;
}

export const TIDLIGST_MULIG_START_DATO = new Date(2021, 0, 1);
export const eqBehandlingsperiode = struct<VirkningstidspunktFormData>({
    fraOgMed: eqNullable(D.Eq),
    tilOgMed: eqNullable(D.Eq),
});

export const virkningstidspunktSchema = yup
    .object<VirkningstidspunktFormData>({
        fraOgMed: yup
            .date()
            .nullable()
            .required('Du må velge virkningstidspunkt for supplerende stønad')
            .min(TIDLIGST_MULIG_START_DATO),
        tilOgMed: yup
            .date()
            .nullable()
            .required('Du må velge til-og-med-dato')
            .test(
                'maks12MndStønadsperiode',
                'Stønadsperioden kan ikke være lenger enn 12 måneder',
                function (tilOgMed) {
                    const { fraOgMed } = this.parent;
                    if (!tilOgMed || !fraOgMed) {
                        return false;
                    }
                    if (DateFns.differenceInYears(tilOgMed, fraOgMed) >= 1) {
                        return false;
                    }
                    return true;
                }
            )
            .test('isAfterFom', 'Sluttdato må være etter startdato', function (tilOgMed) {
                const { fraOgMed } = this.parent;
                if (!tilOgMed || !fraOgMed) {
                    return false;
                }

                return fraOgMed <= tilOgMed;
            }),
    })
    .required();
