import * as yup from 'yup';
import { KontrollsamtaleState } from '~src/features/kontrollsamtale/kontrollsamtale.slice.ts';

export type FormData = Pick<KontrollsamtaleState, 'personligOppmøte'>;

export const schema = yup.object<FormData>({
    personligOppmøte: yup.boolean().nullable().required('Du må svare på om brukeren har møtt personlig'),
});
