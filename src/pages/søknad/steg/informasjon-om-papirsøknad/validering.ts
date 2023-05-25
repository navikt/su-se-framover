import * as DateFns from 'date-fns';

import { ForVeilederPapirsøknad } from '~src/features/søknad/søknad.slice';
import { GrunnForPapirinnsending } from '~src/features/søknad/types';
import yup from '~src/lib/validering';
import { Søknadstype } from '~src/types/Søknadinnhold';

export type FormData = ForVeilederPapirsøknad;

export const schema = yup.object<FormData>({
    type: yup.string().required() as yup.Schema<Søknadstype.Papirsøknad>,
    mottaksdatoForSøknad: yup
        .string()
        .required('Fyll ut mottaksdatoen for søknaden')
        .test('is-date', 'Invalid date format', (value) => {
            if (!value) {
                return false;
            }
            const parsedDate = DateFns.parse(value, 'yyyy-MM-dd', new Date());
            return DateFns.isValid(parsedDate);
        })
        .test('not-in-future', 'Mottaksdato kan ikke være i fremtiden', (value) => {
            if (!value) {
                return false;
            }
            const today = DateFns.startOfDay(new Date());
            const parsedDate = DateFns.parse(value, 'yyyy-MM-dd', new Date());
            return DateFns.isBefore(parsedDate, today) || DateFns.isEqual(parsedDate, today);
        }),
    grunnForPapirinnsending: yup
        .mixed<GrunnForPapirinnsending>()
        .oneOf(Object.values(GrunnForPapirinnsending), 'Velg hvorfor søknaden var sendt inn uten personlig oppmøte'),
    annenGrunn: yup
        .string()
        .nullable()
        .defined()
        .when('grunnForPapirinnsending', {
            is: GrunnForPapirinnsending.Annet,
            then: yup.string().required('Fyll ut begrunnelse for hvorfor søker ikke møtte opp personlig'),
            otherwise: yup.string().nullable().defined(),
        }),
});
