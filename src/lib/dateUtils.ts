import * as DateFns from 'date-fns';
import { IntlShape } from 'react-intl';

import { Periode } from '~types/Fradrag';

import { Nullable } from './types';

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

    return DateFns.format(date, 'yyyy-MM-dd');
};

export const erPeriodeInnenforEnStønadsperiode = (periode: Periode, stønadsperiode: Periode) => {
    return (
        !DateFns.isBefore(periode.fraOgMed, stønadsperiode.fraOgMed) &&
        !DateFns.isAfter(periode.tilOgMed, stønadsperiode.tilOgMed)
    );
};
