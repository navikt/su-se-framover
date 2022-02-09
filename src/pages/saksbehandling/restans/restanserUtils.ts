import * as arr from 'fp-ts/Array';
import * as Ord from 'fp-ts/Ord';
import * as S from 'fp-ts/string';

import { pipe } from '~lib/fp';
import { Restans, RestansStatus, RestansType } from '~types/Restans';

export type RestansKolonner = 'saksnummer' | 'typeBehandling' | 'status' | 'behandlingStartet';
export type AriaSortVerdier = 'none' | 'ascending' | 'descending';

export const isRestansType = (x: RestansType | RestansStatus): x is RestansType => Object.keys(RestansType).includes(x);
export const isRestansStatus = (x: RestansType | RestansStatus): x is RestansStatus =>
    Object.keys(RestansStatus).includes(x);

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
