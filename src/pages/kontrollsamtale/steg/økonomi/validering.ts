import * as yup from 'yup';
import { KontrollsamtaleState } from '~src/features/kontrollsamtale/kontrollsamtale.slice.ts';

export type FormData = Pick<KontrollsamtaleState, 'økonomiskSituasjon'>;

export const schema = yup.object<FormData>({
    økonomiskSituasjon: yup.boolean().nullable().required('Du må svare '),
});
