import * as DateFns from 'date-fns';
import { pipe } from 'fp-ts/lib/function';

import yup from '~src/lib/validering';

export interface OpprettKlageFormData {
    journalpostId: string;
    datoKlageMottatt: Date;
}

export const opprettKlageSchema = yup.object<OpprettKlageFormData>({
    journalpostId: yup
        .string()
        .trim()
        .required()
        .test('isNumeric', 'Må være et tall', function (id) {
            return pipe(id, Number, Number.isInteger);
        }),
    datoKlageMottatt: yup
        .date()
        .required()
        .typeError('Feltet må være en dato på formatet dd/mm/yyyy')
        .max(DateFns.endOfDay(new Date())),
});
