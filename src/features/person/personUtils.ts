import { Gender } from '@navikt/nap-person-card';

import { Kjønn, Navn, Person } from '~api/personApi';

export function showName(navn: Navn) {
    return `${navn.fornavn}${navn.mellomnavn ? ` ${navn.mellomnavn} ` : ' '}${navn.etternavn}`;
}

export const getGender = (søker: Person) => {
    if (søker.kjønn === Kjønn.Mann) {
        return Gender.male;
    } else if (søker.kjønn === Kjønn.Kvinne) {
        return Gender.female;
    } else {
        return Gender.unknown;
    }
};
