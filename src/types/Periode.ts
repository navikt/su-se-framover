import * as D from 'fp-ts/Date';
import { Eq, struct } from 'fp-ts/Eq';
import * as S from 'fp-ts/string';

import { Nullable } from '~src/lib/types';

export interface Periode<T extends string | Date = Date> {
    fraOgMed: T;
    tilOgMed: T;
}

export interface NullablePeriode<T extends string | Date = Date> {
    fraOgMed: Nullable<T>;
    tilOgMed: Nullable<T>;
}

export const eqStringPeriode: Eq<Periode<string>> = struct({
    fraOgMed: S.Eq,
    tilOgMed: S.Eq,
});

export const eqDatePeriode: Eq<Periode<Date>> = struct({
    fraOgMed: D.Eq,
    tilOgMed: D.Eq,
});
