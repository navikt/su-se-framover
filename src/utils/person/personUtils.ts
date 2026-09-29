import * as DateFns from 'date-fns';

import { Nullable } from '~src/lib/types';
import { Fødsel, Navn } from '~src/types/Person';

export const showName = (navn: Navn) => {
    const mellomnavn = navn.mellomnavn ? ` ${navn.mellomnavn} ` : ' ';
    return `${navn.fornavn}${mellomnavn}${navn.etternavn}`;
};

export const formatFnr = (fnr: string) => `${fnr.substring(0, 6)} ${fnr.substring(6, 11)}`;

// Fast, lovfestet aldersgrense i lov om supplerande stønad til personar med kort butid i Noreg
// (LOV-2005-04-29-21) §§ 2, 3, 5 og 6 - uavhengig av folketrygdens fleksible alderspensjon (62-75 år).
export const LOVFESTET_ALDERSGRENSE_SU = 67;

export const er67EllerEldre = (alder: Nullable<number>): boolean =>
    (alder ?? LOVFESTET_ALDERSGRENSE_SU) >= LOVFESTET_ALDERSGRENSE_SU;
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
    return alderVedDato >= LOVFESTET_ALDERSGRENSE_SU;
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
