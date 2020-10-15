import * as DateFns from 'date-fns';
import { IntlShape } from 'react-intl';

import { Nullable } from './types';

export const formatDateTime = (time: string, intl: IntlShape) => {
    return `${intl.formatDate(time)} ${intl.formatTime(time)}`;
};

export type Utlandsdatoer = Nullable<Array<{ utreisedato: string; innreisedato: string }>>;

export const kalkulerTotaltAntallDagerIUtlandet = (datesArray: Utlandsdatoer) => {
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

export const isValidDayMonthYearFormat = (date: Nullable<string>) => {
    if (!date) {
        return false;
    }

    return DayMonthYearRegExp.test(date);
};

// DD.MM.YYYY / DD-MM-YYYY
const DayMonthYearRegExp = RegExp(/^([0]?[1-9]|[1|2][0-9]|[3][0|1])[./-]([0]?[1-9]|[1][0-2])[./-]([0-9]{4}|[0-9]{2})$/);
