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

export const harFylt67VedDato = (dato: Date, fødsel: Nullable<Fødsel>): Nullable<boolean> => {
    if (!fødsel || !fødsel.dato) {
        return null;
    }

    const alderVedDato = alderSomPersonFyllerPåDato(dato, DateFns.parseISO(fødsel.dato));
    return alderVedDato >= 67;
};

export const fyller67ILøpetAvPeriode = (
    periode: { fraOgMed: Date; tilOgMed: Date },
    fødsel: Nullable<Fødsel>,
): Nullable<boolean> => {
    const erFylt67VedFraOgMed = harFylt67VedDato(periode.fraOgMed, fødsel);
    const erFylt67VedTilOgMed = harFylt67VedDato(periode.tilOgMed, fødsel);

    if (erFylt67VedFraOgMed === null || erFylt67VedTilOgMed === null) {
        return null;
    }

    return !erFylt67VedFraOgMed && erFylt67VedTilOgMed;
};
