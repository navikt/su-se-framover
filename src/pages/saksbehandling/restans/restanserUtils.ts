import * as arr from 'fp-ts/Array';
import * as Ord from 'fp-ts/Ord';
import * as S from 'fp-ts/string';

import { AriaSortVerdi } from '~src/components/tabell/SuTabell';
import { pipe } from '~src/lib/fp';
import { Restans } from '~src/types/Restans';

export enum RestansKolonne {
    saksnummer = 'saksnummer',
    typeBehandling = 'typeBehandling',
    status = 'status',
    behandlingStartet = 'behandlingStartet',
}

export const sortTabell = (restanser: Restans[], kolonne: RestansKolonne, sortVerdi: AriaSortVerdi) => {
    return pipe(restanser, arr.sortBy([kolonneOgRetning(kolonne, sortVerdi)]));

    function kolonneOgRetning(kolonne: RestansKolonne, sortVerdi: AriaSortVerdi): Ord.Ord<Restans> {
        return pipe(
            sortVerdi === 'ascending' ? Ord.reverse(S.Ord) : S.Ord,
            Ord.contramap((r: Restans) => r[kolonne] || '')
        );
    }
};
