import * as DateFns from 'date-fns';
import { createIntl, createIntlCache, FormatDateOptions } from 'react-intl';

import { Languages } from '~lib/i18n';
import { Nullable } from '~lib/types';
import { Periode } from '~types/Periode';

const cache = createIntlCache();
const intl = createIntl({ locale: Languages.nb }, cache);

enum DateFormats {
    IsoDateOnly = 'yyyy-MM-dd',
}

const formatDateOptions: FormatDateOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
};

export const formatDateTime = (time: string) => {
    return `${intl.formatDate(time, formatDateOptions)} ${intl.formatTime(time)}`;
};

export const formatDate = (date: string) => intl.formatDate(date, formatDateOptions);

export const formatMonthYear = (date: string) =>
    intl.formatDate(date, {
        ...formatDateOptions,
        day: undefined,
    });

export type Utlandsdatoer = Array<{ utreisedato: string; innreisedato: string }>;

export const kalkulerTotaltAntallDagerIUtlandet = (datesArray: Nullable<Utlandsdatoer>) => {
    if (!datesArray) return 0;

    return (
        datesArray.reduce(
            (acc, { utreisedato, innreisedato }) =>
                acc + DateFns.differenceInCalendarDays(DateFns.parseISO(innreisedato), DateFns.parseISO(utreisedato)),
            0
        ) - datesArray.length
    );
};

export const toDateOrNull = (date: string | undefined): Date | null => {
    if (!date) {
        return null;
    }

    return new Date(date);
};

export const isValidDayMonthYearFormat = (date: Nullable<string>): boolean => {
    if (!date) {
        return false;
    }

    return DateFns.isValid(DateFns.parse(date, 'dd.MM.yyyy', new Date()));
};

export const isValidInterval = (fom: Nullable<Date>, tom: Nullable<Date>) => fom && tom && DateFns.isAfter(tom, fom);

export const toStringDateOrNull = (date: Date | null) => {
    if (!date) return null;

    return DateFns.format(date, DateFormats.IsoDateOnly);
};

// Tipper det ikke blir nødvendig med "overload" for Periode<Date>
export const formatPeriode = (periode: Periode<string>) =>
    `${formatMonthYear(periode.fraOgMed)} – ${formatMonthYear(periode.tilOgMed)}`;

export const toIsoDateOnlyString = (date: Date) => DateFns.format(date, DateFormats.IsoDateOnly);

export const startenPåNesteMåned = (date: Date) => DateFns.startOfMonth(DateFns.addMonths(date, 1));

export const startenPåForrigeMåned = (date: Date) => DateFns.startOfMonth(DateFns.subMonths(date, 1));

export const erDatoFørStartenPåNesteMåned = (date: Date) => DateFns.isBefore(date, startenPåNesteMåned(new Date()));

export const sluttenAvMåneden = (d: Date) => DateFns.endOfMonth(d);

/**
 * Parser datostreng på formatet @see {@link DateFormats.IsoDateOnly}
 * Gir null dersom @param str er null
 * @returns null hvis @param str er null; parset dato ellers
 */
export const parseIsoDateOnly = (str: string) => DateFns.parse(str, DateFormats.IsoDateOnly, new Date());
