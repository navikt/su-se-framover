import * as yup from 'yup';
import { KontrollsamtaleState } from '~src/features/kontrollsamtale/kontrollsamtale.slice.ts';

export type FormData = Pick<
    KontrollsamtaleState,
    | 'harVærtUtenlands'
    | 'harPlanerOmUtenlandsreise'
    | 'reisedokumentasjon'
    | 'utenlandsoppholdDatoer'
    | 'planlagteUtenlandsreiseDatoer'
>;

const reiseDatoSchema = yup.object({
    utreisedato: yup.string().required('Velg utreisedato'),
    innreisedato: yup.string().required('Velg innreisedato'),
});
export const schema = yup.object({
    harVærtUtenlands: yup.boolean().nullable().required('Du må svare'),
    harPlanerOmUtenlandsreise: yup.boolean().nullable().required('Du må svare'),
    reisedokumentasjon: yup.boolean().nullable().required('Du må svare'),
    utenlandsoppholdDatoer: yup.array().of(reiseDatoSchema).default([]),
    planlagteUtenlandsreiseDatoer: yup.array().of(reiseDatoSchema).default([]),
});
