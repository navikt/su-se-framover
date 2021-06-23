import { Navn } from '~api/personApi';

export function showName(navn: Navn) {
    return `${navn.fornavn}${navn.mellomnavn ? ` ${navn.mellomnavn} ` : ' '}${navn.etternavn}`;
}
