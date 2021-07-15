import { Navn } from '~api/personApi';

export function showName(navn: Navn) {
    const mellomnavn = navn.mellomnavn ? ` ${navn.mellomnavn} ` : ' ';
    return `${navn.fornavn}${mellomnavn}${navn.etternavn}`;
}
