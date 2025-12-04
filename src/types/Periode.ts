import * as D from 'fp-ts/Date';
import { Eq, struct } from 'fp-ts/Eq';
import * as S from 'fp-ts/string';

import { eqNullable, Nullable } from '~src/lib/types';

//TODO - rename type til Periode, så kan Periode interfacet få et annet navn (sikkert endringer i et par filer)
export type PeriodeType = Periode | NullablePeriode;

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

export const eqNullableDatePeriode = struct<{ fraOgMed: Nullable<Date>; tilOgMed: Nullable<Date> }>({
    fraOgMed: eqNullable(D.Eq),
    tilOgMed: eqNullable(D.Eq),
});

export interface PeriodeMedOptionalTilOgMed<T extends string | Date = Date> {
    fraOgMed: T;
    tilOgMed: Nullable<T>;
}
