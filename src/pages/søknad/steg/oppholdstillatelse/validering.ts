import { SøknadState } from '~src/features/søknad/søknad.slice';
import { TypeOppholdstillatelse } from '~src/features/søknad/types';
import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';

export type FormData = SøknadState['oppholdstillatelse'];

export const schema = yup.object<FormData>({
    erNorskStatsborger: yup.boolean().nullable().required('Fyll ut om du er norsk statsborger'),
    eøsborger: yup
        .boolean()
        .nullable()
        .defined()
        .when('erNorskStatsborger', { is: false, then: yup.boolean().required('Fyll ut om du er EØS-borger') }),
    harOppholdstillatelse: yup
        .boolean()
        .nullable()
        .defined()
        .when('erNorskStatsborger', {
            is: false,
            then: yup.boolean().required('Fyll ut om du har oppholdstillatelse'),
        }),
    familieforening: yup.boolean().nullable().required('Fyll ut spørsmål om familieforening'),
    typeOppholdstillatelse: yup
        .mixed<Nullable<TypeOppholdstillatelse>>()
        .nullable()
        .defined()
        .when('harOppholdstillatelse', {
            is: true,
            then: yup
                .mixed()
                .nullable()
                .oneOf(Object.values(TypeOppholdstillatelse), 'Du må velge type oppholdstillatelse')
                .required(),
        }),
    statsborgerskapAndreLand: yup.boolean().nullable().required('Fyll ut om du har statsborgerskap i andre land'),
    statsborgerskapAndreLandFritekst: yup
        .string()
        .nullable(true)
        .defined()
        .when('statsborgerskapAndreLand', {
            is: true,
            then: yup.string().nullable().min(1).required('Fyll ut land du har statsborgerskap i'),
        }),
});
