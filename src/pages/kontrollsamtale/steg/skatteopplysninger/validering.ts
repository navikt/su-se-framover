import * as yup from 'yup';
import { KontrollsamtaleState } from '~src/features/kontrollsamtale/kontrollsamtale.slice.ts';

export type FormData = Pick<KontrollsamtaleState, 'skatteOpplysninger'>;

export const schema = yup.object<FormData>({
    skatteOpplysninger: yup.boolean().nullable().required('Du må svare'),
});
