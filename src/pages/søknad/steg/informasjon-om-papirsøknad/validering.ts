import { ForVeilederPapirsøknad } from '~src/features/søknad/søknad.slice';
import { GrunnForPapirinnsending } from '~src/features/søknad/types';
import yup from '~src/lib/validering';
import { Søknadstype } from '~src/types/Søknad';

export type FormData = ForVeilederPapirsøknad;

export const schema = yup.object<FormData>({
    type: yup.string().required() as yup.Schema<Søknadstype.Papirsøknad>,
    mottaksdatoForSøknad: yup
        .date()
        .max(new Date(), 'Mottaksdato kan ikke være i fremtiden')
        .nullable()
        .required('Fyll ut mottaksdatoen for søknaden') as unknown as yup.Schema<string>,
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
