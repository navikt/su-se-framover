import * as D from 'fp-ts/lib/Date';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';

import { eqNullable } from '~src/lib/types';
import { NullablePeriode, Periode, PeriodeType } from '~src/types/Periode';
import * as DateUtils from '~src/utils/date/dateUtils';

export const lagTomPeriode = (): PeriodeType => ({ fraOgMed: null, tilOgMed: null });

export const lagStringPeriode = (periode: Periode<string>): Periode<string> => ({
    fraOgMed: periode.fraOgMed,
    tilOgMed: periode.tilOgMed,
});

export const lagDatePeriodeAvStringPeriode = (periode: Periode<string>): Periode<Date> => ({
    fraOgMed: DateUtils.parseNonNullableIsoDateOnly(periode.fraOgMed),
    tilOgMed: DateUtils.parseNonNullableIsoDateOnly(periode.tilOgMed),
});

export const lagDatePeriodeAvStringPeriodeEllerTomPeriode = (periode?: Periode<string>) =>
    periode ? lagDatePeriodeAvStringPeriode(periode) : lagTomPeriode();

/**
 *
 * @param p skal være en periode der fraOgMed & tilOgMed må være utfylt
 * @returns Periode objekt i IsoDate
 */
export const periodeTilIsoDateString = (p: Periode | NullablePeriode) => ({
    fraOgMed: DateUtils.toIsoDateOnlyString(p.fraOgMed!),
    tilOgMed: DateUtils.toIsoDateOnlyString(p.tilOgMed!),
});

export const eqPeriode = struct<NullablePeriode>({
    fraOgMed: eqNullable(D.Eq),
    tilOgMed: eqNullable(D.Eq),
});

export const eqStringPeriode = struct<Periode<string>>({
    fraOgMed: S.Eq,
    tilOgMed: S.Eq,
});
