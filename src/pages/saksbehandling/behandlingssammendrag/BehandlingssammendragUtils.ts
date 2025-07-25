import * as arr from 'fp-ts/Array';
import * as Ord from 'fp-ts/Ord';
import * as S from 'fp-ts/string';

import { AriaSortVerdi } from '~src/components/tabell/SuTabell';
import { pipe } from '~src/lib/fp';
import { Behandlingssammendrag, BehandlingssammendragMedId } from '~src/types/Behandlingssammendrag';
import { formatPeriode } from '~src/utils/periode/periodeUtils';

export enum BehandlingssammendragKolonne {
    saksnummer = 'saksnummer',
    typeBehandling = 'typeBehandling',
    status = 'status',
    periode = 'periode',
    behandlingStartet = 'behandlingStartet',
}

export const sortTabell = (
    behandlingssammendrag: BehandlingssammendragMedId[],
    kolonne: BehandlingssammendragKolonne,
    sortVerdi: AriaSortVerdi,
) => {
    return pipe(behandlingssammendrag, arr.sortBy([kolonneOgRetning(kolonne, sortVerdi)]));

    function kolonneOgRetning(
        kolonne: BehandlingssammendragKolonne,
        sortVerdi: AriaSortVerdi,
    ): Ord.Ord<Behandlingssammendrag> {
        return pipe(
            sortVerdi === 'ascending' ? Ord.reverse(S.Ord) : S.Ord,
            Ord.contramap((r: Behandlingssammendrag) =>
                kolonne === BehandlingssammendragKolonne.periode
                    ? r.periode
                        ? formatPeriode(r.periode)
                        : ''
                    : r[kolonne] || '',
            ),
        );
    }
};
