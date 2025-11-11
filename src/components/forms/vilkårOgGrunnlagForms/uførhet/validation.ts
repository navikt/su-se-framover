import * as DateFns from 'date-fns';
import { maxTime, minTime } from 'date-fns/constants';

import { Nullable } from '~src/lib/types';
import yup, { validateStringAsNonNegativeNumber } from '~src/lib/validering';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { NullablePeriode } from '~src/types/Periode';
import * as DateUtils from '~src/utils/date/dateUtils';

import { UføreperiodeFormData, UførhetFormData } from './UførhetFormUtils';

const uføregrunnlagFormDataSchema = (erGRegulering: boolean) =>
    yup.object<UføreperiodeFormData>({
        periode: yup
            .object<NullablePeriode>({
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
            })
            .required(),
        oppfylt: erGRegulering
            ? yup
                  .mixed<UføreResultat>()
                  .equals([UføreResultat.VilkårOppfylt], 'Vilkår må være oppfylt ved g-regulering')
            : yup
                  .mixed()
                  .defined()
                  .oneOf(
                      [
                          UføreResultat.VilkårOppfylt,
                          UføreResultat.VilkårIkkeOppfylt,
                          UføreResultat.HarUføresakTilBehandling,
                      ],
                      'Du må velge om bruker har vedtak om uføretrygd eller uføresak til behandling',
                  ),
        uføregrad: yup.mixed<string>().when('oppfylt', {
            is: UføreResultat.VilkårOppfylt,
            then: yup.string().test('uføregrad', 'uføregrad må være minst 1, og maks 100', function (value) {
                return value ? Number.parseInt(value, 10) <= 100 && Number.parseInt(value, 10) >= 1 : false;
            }),
        }),
        forventetInntekt: yup.mixed<string>().when('oppfylt', {
            is: UføreResultat.VilkårOppfylt,
            then: validateStringAsNonNegativeNumber(),
            otherwise: yup.string().notRequired(),
        }),
    });

export const uførhetSchema = (erGRegulering: boolean) =>
    yup
        .object<UførhetFormData>({
            grunnlag: yup
                .array<UføreperiodeFormData>(uføregrunnlagFormDataSchema(erGRegulering).required())
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
                                DateUtils.isValidInterval(v1.periode.fraOgMed, v1.periode.tilOgMed) &&
                                uføregrunnlager.some(
                                    (v2) =>
                                        v1 !== v2 &&
                                        DateUtils.isValidInterval(v2.periode.fraOgMed, v2.periode.tilOgMed) &&
                                        DateFns.areIntervalsOverlapping(
                                            {
                                                start: v1.periode.fraOgMed ?? minTime,
                                                end: v1.periode.tilOgMed ?? maxTime,
                                            },
                                            {
                                                start: v2.periode.fraOgMed ?? minTime,
                                                end: v2.periode.tilOgMed ?? maxTime,
                                            },
                                            { inclusive: true },
                                        ),
                                ),
                        );
                        return !harOverlapp;
                    },
                ),
        })
        .required();
