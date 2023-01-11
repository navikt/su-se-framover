import * as RemoteData from '@devexperts/remote-data-ts';
import { Email } from '@navikt/ds-icons';
import { Button, Table } from '@navikt/ds-react';
import * as arr from 'fp-ts/Array';
import * as Ord from 'fp-ts/Ord';
import * as S from 'fp-ts/string';
import React from 'react';
import { Link } from 'react-router-dom';

import * as DokumentApi from '~src/api/dokumentApi';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummeringspanel/Oppsummeringspanel';
import SuTabell, { AriaSortVerdi } from '~src/components/tabell/SuTabell';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { DokumentIdType } from '~src/types/dokument/Dokument';
import { Klage, KlageStatus } from '~src/types/Klage';
import { Vedtak } from '~src/types/Vedtak';
import { formatDateTime, formatPeriode } from '~src/utils/date/dateUtils';
import { getBlob } from '~src/utils/dokumentUtils';

import messages from '../sakintro-nb';

import styles from './Vedtakstabell.module.less';

enum VedtakstabellKolonner {
    vedtakstype = 'vedtakstype',
    resultat = 'resultat',
    periode = 'periode',
    iverksatt_tidspunkt = 'iverksatt-tidspunkt',
}

type VedtakEllerOversendtKlage = Vedtak | Klage;
type VedtakOgOversendteKlager = Array<Vedtak | Klage>;

const isOversendtKlage = (v: Vedtak | Klage): v is Klage => !('periode' in v);

const Vedtakstabell = (props: { sakId: string; vedtakOgOversendteKlager: VedtakOgOversendteKlager }) => {
    const { formatMessage } = useI18n({ messages });

    const sorterTabell = (
        vedtak: VedtakOgOversendteKlager,
        kolonne: VedtakstabellKolonner,
        sortVerdi: AriaSortVerdi
    ) => {
        return pipe(vedtak, arr.sortBy([kolonneOgRetning(kolonne, sortVerdi)]));

        function kolonneOgRetning(
            kolonne: VedtakstabellKolonner,
            sortVerdi: AriaSortVerdi
        ): Ord.Ord<VedtakEllerOversendtKlage> {
            return pipe(
                sortVerdi === 'ascending' ? Ord.reverse(S.Ord) : S.Ord,
                Ord.contramap((v: VedtakEllerOversendtKlage) => {
                    switch (kolonne) {
                        case VedtakstabellKolonner.iverksatt_tidspunkt:
                            return v.opprettet;
                        case VedtakstabellKolonner.periode:
                            return isOversendtKlage(v) ? '-' : `${v?.periode?.fraOgMed} - ${v?.periode?.tilOgMed}`;
                        case VedtakstabellKolonner.resultat:
                            return isOversendtKlage(v)
                                ? formatMessage(`datacell.vedtakstype.${v.status as KlageStatus.OVERSENDT}`)
                                : formatMessage(`datacell.vedtakstype.${v.type}`);
                        case VedtakstabellKolonner.vedtakstype:
                            return isOversendtKlage(v)
                                ? formatMessage(`datacell.vedtakstype.${v.status as KlageStatus.OVERSENDT}`)
                                : formatMessage(`datacell.vedtakstype.${v.type}`);
                    }
                })
            );
        }
    };

    return (
        <Oppsummeringspanel
            ikon={Oppsummeringsikon.Liste}
            farge={Oppsummeringsfarge.Grønn}
            tittel={formatMessage('vedtak.table.tittel')}
        >
            <SuTabell
                kolonnerConfig={{
                    kolonner: VedtakstabellKolonner,
                    defaultKolonneSorteresEtter: VedtakstabellKolonner.iverksatt_tidspunkt,
                }}
                tableHeader={() => (
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader sortable sortKey={VedtakstabellKolonner.vedtakstype}>
                                {formatMessage('header.vedtakstype')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader sortable sortKey={VedtakstabellKolonner.resultat}>
                                {formatMessage('header.resultat')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader sortable sortKey={VedtakstabellKolonner.periode}>
                                {formatMessage('header.periode')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader sortable sortKey={VedtakstabellKolonner.iverksatt_tidspunkt}>
                                {formatMessage('header.iverksattidspunkt')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader></Table.ColumnHeader>
                            <Table.ColumnHeader></Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                )}
                tableBody={(sortertKolonne, sortVerdi) => (
                    <Table.Body>
                        {sorterTabell(props.vedtakOgOversendteKlager, sortertKolonne, sortVerdi).map((vedtak) => {
                            const [hentDokumenterStatus, hentDokumenter] = useApiCall(DokumentApi.hentDokumenter);
                            return (
                                <Table.Row key={vedtak.id}>
                                    <Table.DataCell>
                                        {isOversendtKlage(vedtak)
                                            ? formatMessage(
                                                  `datacell.vedtakstype.${vedtak.status as KlageStatus.OVERSENDT}`
                                              )
                                            : formatMessage(`datacell.vedtakstype.${vedtak.type}`)}
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        {isOversendtKlage(vedtak)
                                            ? formatMessage(
                                                  `datacell.resultat.${vedtak.status as KlageStatus.OVERSENDT}`
                                              )
                                            : formatMessage(`datacell.resultat.${vedtak.type}`)}
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        {'periode' in vedtak && vedtak.periode ? formatPeriode(vedtak.periode) : '-'}
                                    </Table.DataCell>
                                    <Table.DataCell>{formatDateTime(vedtak.opprettet)}</Table.DataCell>
                                    <Table.DataCell>
                                        <Link
                                            to={Routes.vedtaksoppsummering.createURL({
                                                sakId: props.sakId,
                                                vedtakId: vedtak.id,
                                            })}
                                        >
                                            {formatMessage('dataCell.seOppsummering')}
                                        </Link>
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        {isOversendtKlage(vedtak) || vedtak.harDokument ? (
                                            <Button
                                                className={styles.seBrevButton}
                                                variant="secondary"
                                                size={'small'}
                                                loading={RemoteData.isPending(hentDokumenterStatus)}
                                                onClick={() => {
                                                    hentDokumenter(
                                                        {
                                                            id: vedtak.id,
                                                            idType: isOversendtKlage(vedtak)
                                                                ? DokumentIdType.Klage
                                                                : DokumentIdType.Vedtak,
                                                        },
                                                        (dokumenter) =>
                                                            window.open(URL.createObjectURL(getBlob(dokumenter[0])))
                                                    );
                                                }}
                                            >
                                                <Email />
                                            </Button>
                                        ) : (
                                            '-'
                                        )}
                                    </Table.DataCell>
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                )}
            />
        </Oppsummeringspanel>
    );
};

export default Vedtakstabell;
