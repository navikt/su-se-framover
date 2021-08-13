import * as arr from 'fp-ts/Array';
import * as Ord from 'fp-ts/Ord';
import * as S from 'fp-ts/string';

import { pipe } from '~lib/fp';
import { Restans, RestansStatus, RestansType } from '~types/Restans';

import messages from './restanser-nb';

export type RestansKolonner = 'saksnummer' | 'typeBehandling' | 'status' | 'behandlingStartet';
export type AriaSortVerdier = 'none' | 'ascending' | 'descending';

export const formatRestansType = (type: RestansType, formatMessage: (string: keyof typeof messages) => string) => {
    switch (type) {
        case RestansType.REVURDERING:
            return formatMessage('restans.typeBehandling.REVURDERING');
        case RestansType.SØKNADSBEHANDLING:
            return formatMessage('restans.typeBehandling.SØKNADSBEHANDLING');
    }
};

export const formatRestansStatus = (
    status: RestansStatus,
    formatMessage: (string: keyof typeof messages) => string
) => {
    switch (status) {
        case RestansStatus.NY_SØKNAD:
            return formatMessage('restans.status.NY_SØKNAD');
        case RestansStatus.TIL_ATTESTERING:
            return formatMessage('restans.status.TIL_ATTESTERING');
        case RestansStatus.UNDERKJENT:
            return formatMessage('restans.status.UNDERKJENT');
        case RestansStatus.UNDER_BEHANDLING:
            return formatMessage('restans.status.UNDER_BEHANDLING');
    }
};

export const sortTabell = (restanser: Restans[], kolonne: RestansKolonner | 'ingen', sortVerdi: AriaSortVerdier) => {
    if (kolonne === 'ingen' || sortVerdi === 'none') {
        return restanser;
    }

    return pipe(restanser, arr.sortBy([kolonneOgRetning(kolonne, sortVerdi)]));

    function kolonneOgRetning(kolonne: RestansKolonner, sortVerdi: AriaSortVerdier): Ord.Ord<Restans> {
        return pipe(
            sortVerdi === 'ascending' ? Ord.reverse(S.Ord) : S.Ord,
            Ord.contramap((r: Restans) => r[kolonne] || '')
        );
    }
};
