import * as arr from 'fp-ts/Array';
import * as N from 'fp-ts/number';
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
        const ord: Ord.Ord<Behandlingssammendrag> =
            kolonne === BehandlingssammendragKolonne.saksnummer
                ? pipe(
                      N.Ord,
                      Ord.contramap((r: Behandlingssammendrag) => Number(r.saksnummer)),
                  )
                : pipe(
                      S.Ord,
                      Ord.contramap((r: Behandlingssammendrag) =>
                          kolonne === BehandlingssammendragKolonne.periode
                              ? r.periode
                                  ? formatPeriode(r.periode)
                                  : ''
                              : r[kolonne] || '',
                      ),
                  );

        return sortVerdi === 'descending' ? Ord.reverse(ord) : ord;
    }
};
