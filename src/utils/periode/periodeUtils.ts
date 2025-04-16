import * as D from 'fp-ts/lib/Date';
import { struct } from 'fp-ts/lib/Eq';

import { eqNullable } from '~src/lib/types';
import { NullablePeriode, Periode, PeriodeMedOptionalTilOgMed, PeriodeType } from '~src/types/Periode';
import * as DateUtils from '~src/utils/date/dateUtils';
import { formatDayMonthYear, formatMonthYear } from '~src/utils/date/dateUtils';

export const lagTomPeriode = (): PeriodeType => ({ fraOgMed: null, tilOgMed: null });

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

export const formatPeriodeMonthYear = (periode: Periode<string>) =>
    `${DateUtils.formatMonthYear(periode.fraOgMed)} – ${DateUtils.formatMonthYear(periode.tilOgMed)}`;

export const formatPeriodeMedOptionalTilOgMed = (periode: PeriodeMedOptionalTilOgMed<string>) =>
    `${DateUtils.formatMonthYear(periode.fraOgMed)} – ${periode.tilOgMed ? DateUtils.formatMonthYear(periode.tilOgMed) : 'Ingen sluttdato'}`;

// Tipper det ikke blir nødvendig med "overload" for Periode<Date>
export const formatPeriode = (periode: Periode<string>) =>
    `${formatMonthYear(periode.fraOgMed)} – ${formatMonthYear(periode.tilOgMed)}`;

export const formatPeriodeMedDager = (periode: Periode<string>) =>
    `${formatDayMonthYear(periode.fraOgMed)} – ${formatDayMonthYear(periode.tilOgMed)}`;
