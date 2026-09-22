import { Fødsel } from '~src/types/Person';

import { fyller67ILøpetAvPeriode, harFylt67VedDato } from './personUtils';

const lagFødsel = (dato: string | null): Fødsel => ({
    dato,
    år: dato ? new Date(dato).getFullYear() : 1957,
    alder: 0,
});

describe('harFylt67VedDato', () => {
    it('returnerer false når personen klart ikke har fylt 67 ved gitt dato', () => {
        expect(harFylt67VedDato(new Date(2024, 0, 1), lagFødsel('1960-05-15'))).toBe(false);
    });

    it('returnerer true når personen klart har fylt 67 ved gitt dato', () => {
        expect(harFylt67VedDato(new Date(2024, 0, 1), lagFødsel('1950-05-15'))).toBe(true);
    });

    it('returnerer true når gitt dato er samme dag eller etter 67-årsdagen', () => {
        // Født 1957-03-10 -> fyller 67 år 2024-03-10
        expect(harFylt67VedDato(new Date(2024, 2, 15), lagFødsel('1957-03-10'))).toBe(true);
    });

    it('returnerer false når gitt dato er før 67-årsdagen samme måned', () => {
        // Født 1957-03-10 -> fyller ikke 67 før 2024-03-10
        expect(harFylt67VedDato(new Date(2024, 2, 5), lagFødsel('1957-03-10'))).toBe(false);
    });

    it('returnerer null når fødselsdato ikke er kjent', () => {
        expect(harFylt67VedDato(new Date(2024, 0, 1), { dato: null, år: 1957, alder: 67 })).toBeNull();
    });

    it('returnerer null når fødsel er null', () => {
        expect(harFylt67VedDato(new Date(2024, 0, 1), null)).toBeNull();
    });
});

describe('fyller67ILøpetAvPeriode', () => {
    const periode = { fraOgMed: new Date(2024, 0, 1), tilOgMed: new Date(2024, 11, 31) };

    it('returnerer true når personen ikke er fylt 67 ved periodens start, men er det ved periodens slutt', () => {
        // Født 1957-06-15 -> fyller 67 år 2024-06-15, altså midt i perioden
        expect(fyller67ILøpetAvPeriode(periode, lagFødsel('1957-06-15'))).toBe(true);
    });

    it('returnerer false når personen allerede er fylt 67 ved periodens start', () => {
        expect(fyller67ILøpetAvPeriode(periode, lagFødsel('1950-05-15'))).toBe(false);
    });

    it('returnerer false når personen ikke fyller 67 i løpet av perioden', () => {
        expect(fyller67ILøpetAvPeriode(periode, lagFødsel('1960-05-15'))).toBe(false);
    });

    it('returnerer null når fødselsdato ikke er kjent', () => {
        expect(fyller67ILøpetAvPeriode(periode, { dato: null, år: 1957, alder: 67 })).toBeNull();
    });

    it('returnerer null når fødsel er null', () => {
        expect(fyller67ILøpetAvPeriode(periode, null)).toBeNull();
    });
});
