import * as DateFns from 'date-fns';

import { Nullable } from '~src/lib/types';
import { Fødsel, Navn } from '~src/types/Person';

export const showName = (navn: Navn) => {
    const mellomnavn = navn.mellomnavn ? ` ${navn.mellomnavn} ` : ' ';
    return `${navn.fornavn}${mellomnavn}${navn.etternavn}`;
};

export const formatFnr = (fnr: string) => `${fnr.substring(0, 6)} ${fnr.substring(6, 11)}`;

export const er67EllerEldre = (alder: Nullable<number>): boolean => (alder ?? 67) >= 67;
export const alderSomPersonFyllerIÅr = (år: number) => new Date().getFullYear() - år;
export const alderSomPersonFyllerPåDato = (datoSomSjekkes: Date, fødselsmåned: Date) => {
    return DateFns.differenceInYears(datoSomSjekkes, fødselsmåned);
};
export const alderSomPersonFyllerIÅrDate = (årSomSjekkes: number, årFødt: number) => årSomSjekkes - årFødt;

/**
 * Beregner om en person har fylt 67 år ved en gitt dato.
 *
 * Returnerer `null` dersom fødselsdato ikke er kjent (kun fødselsår/alder),
 * siden vi da ikke kan avgjøre nøyaktig hvilken måned/dag personen fyller år.
 */
export const harFylt67VedDato = (dato: Date, fødsel: Nullable<Fødsel>): Nullable<boolean> => {
    if (!fødsel || !fødsel.dato) {
        return null;
    }

    const alderVedDato = alderSomPersonFyllerPåDato(dato, new Date(fødsel.dato));
    return alderVedDato >= 67;
};
