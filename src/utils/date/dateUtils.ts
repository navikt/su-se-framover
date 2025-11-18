import * as DateFns from 'date-fns';
import { createIntl, createIntlCache, FormatDateOptions } from 'react-intl';

import { Languages } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';

const cache = createIntlCache();
const intl = createIntl({ locale: Languages.nb }, cache);

enum DateFormats {
    IsoDateOnly = 'yyyy-MM-dd',
    IsoMonthOnly = 'yyyy-MM',
}

const formatDateOptions: FormatDateOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
};

export const formatDateTime = (time: string) => {
    return `${formatDate(time)} ${intl.formatTime(time)}`;
};

export const formatDate = (date: string) => intl.formatDate(date, formatDateOptions);

export const formatMonthYear = (date: string | Date) =>
    intl.formatDate(date, {
        ...formatDateOptions,
        day: undefined,
    });
export const formatDayMonthYear = (date: string) => intl.formatDate(date, formatDateOptions);

export type Utlandsdatoer = Array<{ utreisedato: string; innreisedato: string }>;

export const kalkulerTotaltAntallDagerIUtlandet = (datesArray: Nullable<Utlandsdatoer>) => {
    if (!datesArray) return 0;

    return (
        datesArray.reduce(
            (acc, { utreisedato, innreisedato }) =>
                acc + DateFns.differenceInCalendarDays(DateFns.parseISO(innreisedato), DateFns.parseISO(utreisedato)),
            0,
        ) - datesArray.length
    );
};

export const toDateOrNull = (date: string | undefined | null): Date | null => {
    if (!date) {
        return null;
    }

    return new Date(date);
};

export const isValidInterval = (fom: Nullable<Date>, tom: Nullable<Date>) => fom && tom && DateFns.isAfter(tom, fom);

export const toStringDateOrNull = (date: Date | null | undefined) => {
    if (!date) return null;

    return DateFns.format(date, DateFormats.IsoDateOnly);
};

export const toIsoMonthOrNull = (date: Date | null) => {
    if (!date) return null;

    return DateFns.format(date, DateFormats.IsoMonthOnly);
};

export const toIsoMonth = (date: Date) => {
    return DateFns.format(date, DateFormats.IsoMonthOnly);
};

export const toIsoDateOnlyString = (date: Date) => DateFns.format(date, DateFormats.IsoDateOnly);

export const startenPåNesteMåned = (date: Date) => DateFns.startOfMonth(DateFns.addMonths(date, 1));

export const startenPåMnd = (d: Date) => DateFns.startOfMonth(d);

export const sluttenAvMåneden = (d: Date) => DateFns.endOfMonth(d);

/**
 * Parser datostreng på formatet @see {@link DateFormats.IsoDateOnly}
 * Gir null dersom @param str er null
 * @returns null hvis @param str er null; parset dato ellers
 */
export const parseIsoDateOnly = (str: string | null) =>
    str ? DateFns.parse(str, DateFormats.IsoDateOnly, new Date()) : null;

export const parseNonNullableIsoDateOnly = (str: string) => DateFns.parse(str, DateFormats.IsoDateOnly, new Date());
