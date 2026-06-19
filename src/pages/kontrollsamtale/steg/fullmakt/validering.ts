import * as yup from 'yup';
import { KontrollsamtaleState } from '~src/features/kontrollsamtale/kontrollsamtale.slice.ts';

export type FormData = Pick<KontrollsamtaleState, 'fullmaktOgLegeerklæring'>;

export const schema = yup.object<FormData>({
    fullmaktOgLegeerklæring: yup
        .boolean()
        .nullable()
        .required('Du må svare på om det foreligger fullmakt eller legeerklæring'),
});
