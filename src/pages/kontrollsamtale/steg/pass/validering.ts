import * as yup from 'yup';
import { KontrollsamtaleState } from '~src/features/kontrollsamtale/kontrollsamtale.slice.ts';

export type FormData = Pick<KontrollsamtaleState, 'originalPass'>;

export const schema = yup.object<FormData>({
    originalPass: yup.boolean().nullable().required('Du må svare på spørsmålet'),
});
