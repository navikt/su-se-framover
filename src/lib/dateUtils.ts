import { IntlShape } from 'react-intl';

export const formatDateTime = (time: string, intl: IntlShape) => {
    return `${intl.formatDate(time)} ${intl.formatTime(time)}`;
};

const makeDate = (dateString: string) => {
    const dateParts = dateString.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    return +new Date(year, month, day);
};

const numberOfDaysBetweeenTwoDates = (utreisedato: string, innreisedato: string) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const timeDifference = makeDate(innreisedato) - makeDate(utreisedato);
    const diffDays = Math.round(timeDifference / oneDay);
    return diffDays;
};

export const addDaysBetweenTwoDates = (datesArray: Array<{ utreisedato: string; innreisedato: string }>) => {
    let x = 0;
    datesArray.map((row) => {
        const utreisedato = row.utreisedato;
        const innreisedato = row.innreisedato;

        x += numberOfDaysBetweeenTwoDates(utreisedato, innreisedato);
    });

    return x;
};
