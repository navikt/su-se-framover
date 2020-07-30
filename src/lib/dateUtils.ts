import { IntlShape } from 'react-intl';
import * as DateFns from 'date-fns';

export const formatDateTime = (time: string, intl: IntlShape) => {
    return `${intl.formatDate(time)} ${intl.formatTime(time)}`;
};

export const kalkulerTotaltAntallDagerIUtlandet = (
    datesArray: Array<{ utreisedato: string; innreisedato: string }>
) => {
    return datesArray.reduce(
        (acc, { utreisedato, innreisedato }) =>
            acc + DateFns.differenceInCalendarDays(DateFns.parseISO(innreisedato), DateFns.parseISO(utreisedato)),
        0
    );
};
