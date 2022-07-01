import { SøknadState } from '~src/features/søknad/søknad.slice';
import yup from '~src/lib/validering';

export type FormData = {
    harSøktAlderspensjon: SøknadState['harSøktAlderspensjon'];
};

export const schema = yup.object<FormData>({
    harSøktAlderspensjon: yup
        .boolean()
        .nullable()
        .required('Fyll ut om du har søkt og fått svar på alderspensjon-søknaden'),
});
