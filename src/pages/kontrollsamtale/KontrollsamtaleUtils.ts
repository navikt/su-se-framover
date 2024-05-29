import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';

export interface OpprettNyKontrollsamtaleFormData {
    nyKontrollsamtaleDato: Nullable<Date>;
}

export const opprettNyKontrollsamtaleSchema = yup.object<OpprettNyKontrollsamtaleFormData>({
    nyKontrollsamtaleDato: yup.date().required('Dato må være satt'),
});

export interface OppdaterKontrollsamtaleFormData {
    nyDato: Date;
}

export const OppdaterKontrollsamtaleSchema = yup.object<OppdaterKontrollsamtaleFormData>({
    nyDato: yup.date().required('Dato må være satt'),
});
