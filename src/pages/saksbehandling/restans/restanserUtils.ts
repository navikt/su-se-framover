import * as arr from 'fp-ts/Array';
import * as Ord from 'fp-ts/Ord';
import * as S from 'fp-ts/string';

import { pipe } from '~lib/fp';
import { Restans } from '~types/Restans';

export type RestansKolonne = 'saksnummer' | 'typeBehandling' | 'status' | 'behandlingStartet';
export type AriaSortVerdi = 'ascending' | 'descending';

export const sortTabell = (restanser: Restans[], kolonne?: RestansKolonne, sortVerdi?: AriaSortVerdi) => {
    if (!kolonne || !sortVerdi) {
        return restanser;
    }

    return pipe(restanser, arr.sortBy([kolonneOgRetning(kolonne, sortVerdi)]));

    function kolonneOgRetning(kolonne: RestansKolonne, sortVerdi: AriaSortVerdi): Ord.Ord<Restans> {
        return pipe(
            sortVerdi === 'ascending' ? Ord.reverse(S.Ord) : S.Ord,
            Ord.contramap((r: Restans) => r[kolonne] || '')
        );
    }
};
