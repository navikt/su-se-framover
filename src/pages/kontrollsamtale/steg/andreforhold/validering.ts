import * as yup from 'yup';
import { KontrollsamtaleState } from '~src/features/kontrollsamtale/kontrollsamtale.slice.ts';

export type FormData = Pick<KontrollsamtaleState, 'andreForhold'>;

export const schema = yup.object<FormData>({
    andreForhold: yup.boolean().nullable().required('Du må svare på spørsmålet'),
});
