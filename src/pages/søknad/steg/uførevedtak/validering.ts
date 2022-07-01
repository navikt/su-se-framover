import { SøknadState } from '~src/features/søknad/søknad.slice';
import yup from '~src/lib/validering';

export type FormData = {
    harUførevedtak: SøknadState['harUførevedtak'];
};

export const schema = yup.object<FormData>({
    harUførevedtak: yup.boolean().nullable().required('Fyll ut om du har fått svar på din søknad om uføretrygd'),
});
