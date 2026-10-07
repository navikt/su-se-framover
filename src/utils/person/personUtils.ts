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

export const finnÅrPersonFyller67 = (fødselsår: number): number => fødselsår + LOVFESTET_ALDERSGRENSE_SU;

// Brukes når fødselsdatoen er ugyldig, men fødselsåret er tilgjengelig. Sammenligner bare årstall,
// så samme år gir `null`: vi vet ikke om bursdagen har passert.
export const harFylt67VedÅr = (dato: Date, fødselsår: number): Nullable<boolean> => {
    const årPersonFyller67 = finnÅrPersonFyller67(fødselsår);
    const datoÅr = dato.getFullYear();

    if (årPersonFyller67 < datoÅr) {
        return true;
    }
    if (årPersonFyller67 > datoÅr) {
        return false;
    }
    return null;
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

// De tre neste tar fødselsår direkte (ikke fødsel/dato), for bruk når fødselsdatoen er ugyldig.
export const harFylt67FørPerioden = (periode: { fraOgMed: Date; tilOgMed: Date }, fødselsår: number): boolean => {
    const årPersonFyller67 = finnÅrPersonFyller67(fødselsår);
    const periodensFørsteÅr = periode.fraOgMed.getFullYear();

    return årPersonFyller67 < periodensFørsteÅr;
};

export const kunneFylle67IPerioden = (periode: { fraOgMed: Date; tilOgMed: Date }, fødselsår: number): boolean => {
    const årPersonFyller67 = finnÅrPersonFyller67(fødselsår);
    const periodensFørsteÅr = periode.fraOgMed.getFullYear();
    const periodensSisteÅr = periode.tilOgMed.getFullYear();

    return årPersonFyller67 >= periodensFørsteÅr && årPersonFyller67 <= periodensSisteÅr;
};

export const skalFylle67EtterPerioden = (periode: { fraOgMed: Date; tilOgMed: Date }, fødselsår: number): boolean => {
    const årPersonFyller67 = finnÅrPersonFyller67(fødselsår);
    const periodensSisteÅr = periode.tilOgMed.getFullYear();

    return årPersonFyller67 > periodensSisteÅr;
};
