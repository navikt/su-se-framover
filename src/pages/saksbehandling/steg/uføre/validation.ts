import * as DateFns from 'date-fns';

import { Nullable } from '~lib/types';
import yup, { validateStringAsNonNegativeNumber } from '~lib/validering';
import { UføreperiodeFormData, FormData } from '~pages/saksbehandling/steg/uføre/types';
import * as DateUtils from '~utils/date/dateUtils';

const uføregrunnlagFormDataSchema = (erGRegulering: boolean) =>
    yup.object<UføreperiodeFormData>({
        id: yup.string(),
        fraOgMed: yup.date().required().defined(),
        tilOgMed: yup
            .date()
            .required()
            .defined()
            .test('etterFom', 'Til-og-med kan ikke være før fra-og-med', function (value) {
                const fom = this.parent.fraOgMed as Nullable<Date>;
                if (value && fom) {
                    return !DateFns.isBefore(value, fom);
                }
                return true;
            }),
        oppfylt: erGRegulering
            ? yup.mixed<boolean>().equals([true], 'Vilkår må være oppfylt ved g-regulering')
            : yup.bool().required().defined(),
        uføregrad: yup.mixed<string>().when('oppfylt', {
            is: true,
            then: yup
                .number()
                .required('Feltet må fylles ut')
                .min(1, 'Feltet må være større eller lik 1')
                .typeError('Feltet må være et tall')
                .max(100, 'Uføregrad må være mellom 0 og 100'),
            otherwise: yup.string().notRequired(),
        }),
        forventetInntekt: yup.mixed<string>().when('oppfylt', {
            is: true,
            then: validateStringAsNonNegativeNumber(),
            otherwise: yup.string().notRequired(),
        }),
    });

export const schema = (erGRegulering: boolean) =>
    yup
        .object<FormData>({
            grunnlag: yup
                .array(uføregrunnlagFormDataSchema(erGRegulering).required())
                .required('Du må legge inn minst én periode')
                .test(
                    'Har ikke overlappende perioder',
                    'To eller flere av periodene overlapper. Du må rette opp i det før du kan gå videre.',
                    function (uføregrunnlager) {
                        if (!uføregrunnlager) {
                            return false;
                        }
                        const harOverlapp = uføregrunnlager.some(
                            (v1) =>
                                DateUtils.isValidInterval(v1.fraOgMed, v1.tilOgMed) &&
                                uføregrunnlager.some(
                                    (v2) =>
                                        v1.id !== v2.id &&
                                        DateUtils.isValidInterval(v2.fraOgMed, v2.tilOgMed) &&
                                        DateFns.areIntervalsOverlapping(
                                            {
                                                start: v1.fraOgMed ?? DateFns.minTime,
                                                end: v1.tilOgMed ?? DateFns.maxTime,
                                            },
                                            {
                                                start: v2.fraOgMed ?? DateFns.minTime,
                                                end: v2.tilOgMed ?? DateFns.maxTime,
                                            },
                                            { inclusive: true }
                                        )
                                )
                        );
                        return !harOverlapp;
                    }
                ),
        })
        .required();
