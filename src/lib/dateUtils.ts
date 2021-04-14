import * as DateFns from 'date-fns';
import { IntlShape } from 'react-intl';

import { Nullable } from './types';

enum DateFormats {
    IsoDateOnly = 'yyyy-MM-dd',
}

export const formatDateTime = (time: string, intl: IntlShape) => {
    return `${intl.formatDate(time)} ${intl.formatTime(time)}`;
};

export const formatMonthYear = (date: string, intl: IntlShape) =>
    intl.formatDate(date, {
        year: 'numeric',
        month: '2-digit',
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

export const toStringDateOrNull = (date: Date | null) => {
    if (!date) return null;

    return DateFns.format(date, DateFormats.IsoDateOnly);
};

export const startenPåNesteMåned = (date: Date) => DateFns.startOfMonth(DateFns.addMonths(date, 1));

export const getStartenPåMånedenTreTilbakeITid = (d: Date) => DateFns.startOfMonth(DateFns.subMonths(d, 3));

/**
 * Parser datostreng på formatet @see {@link DateFormats.IsoDateOnly}
 * Gir null dersom @param str er null
 * @returns null hvis @param str er null; parset dato ellers
 */
export const parseIsoDateOnly = (str: string) => DateFns.parse(str, DateFormats.IsoDateOnly, new Date());
