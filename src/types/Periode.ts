import * as D from 'fp-ts/Date';
import { Eq, struct } from 'fp-ts/Eq';
import * as S from 'fp-ts/string';

export interface Periode<T extends string | Date = Date> {
    fraOgMed: T;
    tilOgMed: T;
}

export const eqStringPeriode: Eq<Periode<string>> = struct({
    fraOgMed: S.Eq,
    tilOgMed: S.Eq,
});

export const eqDatePeriode: Eq<Periode<Date>> = struct({
    fraOgMed: D.Eq,
    tilOgMed: D.Eq,
});
