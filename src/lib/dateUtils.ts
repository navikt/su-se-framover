import * as DateFns from 'date-fns';
import { IntlShape } from 'react-intl';

import { Nullable } from './types';

export const formatDateTime = (time: string, intl: IntlShape) => {
    return `${intl.formatDate(time)} ${intl.formatTime(time)}`;
};

export const kalkulerTotaltAntallDagerIUtlandet = (
    datesArray: Nullable<Array<{ utreisedato: string; innreisedato: string }>>
) => {
    if (!datesArray) return '0';

    return datesArray.reduce(
        (acc, { utreisedato, innreisedato }) =>
            acc + DateFns.differenceInCalendarDays(DateFns.parseISO(innreisedato), DateFns.parseISO(utreisedato)),
        0
    );
};
