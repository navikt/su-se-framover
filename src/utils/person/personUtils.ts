import * as DateFns from 'date-fns';

import { Navn } from '~src/api/personApi';
import { Nullable } from '~src/lib/types';

export function showName(navn: Navn): string {
    const mellomnavn = navn.mellomnavn ? ` ${navn.mellomnavn} ` : ' ';
    return `${navn.fornavn}${mellomnavn}${navn.etternavn}`;
}

export function formatFnr(fnr: string): string {
    return `${fnr.substring(0, 6)} ${fnr.substring(6, 11)}`;
}

export const er67EllerEldre = (alder: Nullable<number>): boolean => (alder ?? 67) >= 67;
export const alderSomPersonFyllerIÅr = (år: number) => new Date().getFullYear() - år;
export const alderSomPersonFyllerPåDato = (datoSomSjekkes: Date, fødselsmåned: Date) => {
    return DateFns.differenceInYears(datoSomSjekkes, fødselsmåned);
};
export const alderSomPersonFyllerIÅrDate = (årSomSjekkes: number, årFødt: number) => årSomSjekkes - årFødt;
