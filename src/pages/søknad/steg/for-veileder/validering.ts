import { ForVeilederDigitalSøknad } from '~src/features/søknad/søknad.slice';
import { Vergemål } from '~src/features/søknad/types';
import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { Søknadstype } from '~src/types/Søknad';

export type FormData = ForVeilederDigitalSøknad;

export const schema = yup.object<FormData>({
    type: yup.string().required() as yup.Schema<Søknadstype.DigitalSøknad>,
    harSøkerMøttPersonlig: yup.boolean().nullable().required('Velg om søker har møtt personlig'),
    harFullmektigEllerVerge: yup
        .mixed<Nullable<Vergemål>>()
        .nullable()
        .defined()
        .when('harSøkerMøttPersonlig', {
            is: false,
            then: yup.string().nullable().required('Velg om søker har fullmektig eller verge'),
        }),
});
