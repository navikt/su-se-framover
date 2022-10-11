import { BodyShort, Table } from '@navikt/ds-react';
import * as arr from 'fp-ts/Array';
import * as Ord from 'fp-ts/Ord';
import * as S from 'fp-ts/string';
import React from 'react';

import { ErrorIcon } from '~src/assets/Icons';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/revurdering/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import SuTabell, { AriaSortVerdi } from '~src/components/tabell/SuTabell';
import {
    getDataCellInfo,
    isSøknadMedEllerUtenBehandling,
    TabellBehandling,
    TabellBehandlinger,
} from '~src/components/tabell/SuTabellUtils';
import { pipe } from '~src/lib/fp';
import { useI18n } from '~src/lib/i18n';
import { formatDateTime } from '~src/utils/date/dateUtils';

import messages from '../sakintro-nb';

import styles from './AvsluttedeBehandlingerTabell.module.less';

enum AvsluttedeBehandlingerKolonner {
    behandlingstype = 'behandlingstype',
    avsluttet_tidspunkt = 'avsluttet_tidspunkt',
    mottatt_opprettet_tidspunkt = 'mottatt_opprettet_tidspunkt',
}

const AvsluttedeBehandlingerTabell = (props: { tabellBehandlinger: TabellBehandlinger }) => {
    const tabelldata = props.tabellBehandlinger.slice();
    const { formatMessage } = useI18n({ messages });

    const sorterTabell = (
        behandlinger: TabellBehandlinger,
        kolonne: AvsluttedeBehandlingerKolonner,
        sortVerdi: AriaSortVerdi
    ) => {
        return pipe(behandlinger, arr.sortBy([kolonneOgRetning(kolonne, sortVerdi)]));

        function kolonneOgRetning(
            kolonne: AvsluttedeBehandlingerKolonner,
            sortVerdi: AriaSortVerdi
        ): Ord.Ord<TabellBehandling> {
            return pipe(
                sortVerdi === 'ascending' ? Ord.reverse(S.Ord) : S.Ord,
                Ord.contramap((b: TabellBehandling) => {
                    const dataCellInfo = getDataCellInfo(b);
                    switch (kolonne) {
                        case AvsluttedeBehandlingerKolonner.behandlingstype:
                            return dataCellInfo.type;
                        case AvsluttedeBehandlingerKolonner.avsluttet_tidspunkt:
                            return dataCellInfo.avsluttetTidspunkt ? dataCellInfo.avsluttetTidspunkt : '-';
                        case AvsluttedeBehandlingerKolonner.mottatt_opprettet_tidspunkt:
                            return dataCellInfo.mottattOpprettetTidspunkt;
                    }
                })
            );
        }
    };

    return (
        <Oppsummeringspanel
            ikon={Oppsummeringsikon.FilError}
            farge={Oppsummeringsfarge.Lilla}
            tittel={formatMessage('avsluttedeBehandlinger.table.tittel')}
        >
            <SuTabell
                kolonnerConfig={{
                    kolonner: AvsluttedeBehandlingerKolonner,
                    defaultKolonneSorteresEtter: AvsluttedeBehandlingerKolonner.mottatt_opprettet_tidspunkt,
                }}
                tableHeader={() => (
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader sortable sortKey={AvsluttedeBehandlingerKolonner.behandlingstype}>
                                {formatMessage('header.behandlingstype')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader sortable sortKey={AvsluttedeBehandlingerKolonner.avsluttet_tidspunkt}>
                                {formatMessage('header.avsluttetTidspunkt')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                sortable
                                sortKey={AvsluttedeBehandlingerKolonner.mottatt_opprettet_tidspunkt}
                            >
                                {formatMessage('header.mottatOpprettetTidspunkt')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader></Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                )}
                tableBody={(sortertKolonne, sortVerdi) => (
                    <Table.Body>
                        {sorterTabell(tabelldata, sortertKolonne, sortVerdi).map((behandling) => {
                            const dataCellInfo = getDataCellInfo(behandling);
                            return (
                                <Table.Row
                                    key={
                                        isSøknadMedEllerUtenBehandling(behandling)
                                            ? `avsluttetBehandling.${behandling.søknad.id}`
                                            : `avsluttetBehandling.${behandling.id}`
                                    }
                                >
                                    <Table.DataCell>
                                        {formatMessage(`datacell.behandlingstype.${dataCellInfo.type}`)}
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        {dataCellInfo.avsluttetTidspunkt
                                            ? formatDateTime(dataCellInfo.avsluttetTidspunkt)
                                            : '-'}
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        {formatDateTime(dataCellInfo.mottattOpprettetTidspunkt)}
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        {isSøknadMedEllerUtenBehandling(behandling) && (
                                            <div className={styles.lukketSøknadIkonDataCell}>
                                                <ErrorIcon />
                                                <BodyShort>{formatMessage(behandling.søknad.lukket!.type)}</BodyShort>
                                            </div>
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

export default AvsluttedeBehandlingerTabell;
