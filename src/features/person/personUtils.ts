import * as RemoteData from '@devexperts/remote-data-ts';
import { Gender } from '@navikt/nap-person-card';

import { ApiError } from '~api/apiClient';
import { Kjønn, Navn, Person } from '~api/personApi';

export function showName(navn: Navn) {
    return `${navn.fornavn}${navn.mellomnavn ? ` ${navn.mellomnavn} ` : ' '}${navn.etternavn}`;
}

export const getGender = (søker: RemoteData.RemoteData<ApiError, Person>) => {
    if (RemoteData.isSuccess(søker)) {
        if (søker.value.kjønn === Kjønn.Mann) {
            return Gender.male;
        } else if (søker.value.kjønn === Kjønn.Kvinne) {
            return Gender.female;
        } else {
            return Gender.unknown;
        }
    }
    return Gender.unknown;
};
