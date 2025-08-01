import * as RemoteData from '@devexperts/remote-data-ts';
import { EnvelopeClosedIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, Table } from '@navikt/ds-react';
import * as arr from 'fp-ts/Array';
import * as Ord from 'fp-ts/Ord';
import * as S from 'fp-ts/string';

import * as DokumentApi from '~src/api/dokumentApi';
import { ErrorIcon } from '~src/assets/Icons';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import SuTabell, { AriaSortVerdi } from '~src/components/tabell/SuTabell';
import {
    getDataCellInfo,
    isKlage,
    isSøknadMedEllerUtenBehandling,
    TabellBehandling,
    TabellBehandlinger,
} from '~src/components/tabell/SuTabellUtils';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { DokumentIdType } from '~src/types/dokument/Dokument';
import { AvsluttKlageStatus } from '~src/types/Klage.ts';
import { formatDateTime } from '~src/utils/date/dateUtils';
import { getBlob } from '~src/utils/dokumentUtils';
import {
    erDokumentGenerertEllerSenere,
    erDokumentIkkeGenerertEnda,
    skalDokumentIkkeGenereres,
} from '~src/utils/søknad/søknadUtils';

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
        sortVerdi: AriaSortVerdi,
    ) => {
        return pipe(behandlinger, arr.sortBy([kolonneOgRetning(kolonne, sortVerdi)]));

        function kolonneOgRetning(
            kolonne: AvsluttedeBehandlingerKolonner,
            sortVerdi: AriaSortVerdi,
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
                }),
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
                            <Table.ColumnHeader></Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                )}
                tableBody={(sortertKolonne, sortVerdi) => (
                    <Table.Body>
                        {sorterTabell(tabelldata, sortertKolonne, sortVerdi).map((behandling) => {
                            const dataCellInfo = getDataCellInfo(behandling);
                            const [hentDokumenterStatus, hentDokumenter] = useApiCall(DokumentApi.hentDokumenter);
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
                                        {dataCellInfo.erOmgjøring &&
                                            ` ${formatMessage('datacell.behandlingstype.omgjøring')}`}
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        {dataCellInfo.avsluttetTidspunkt
                                            ? formatDateTime(dataCellInfo.avsluttetTidspunkt)
                                            : '-'}
                                    </Table.DataCell>
                                    <Table.DataCell>{dataCellInfo.mottattOpprettetTidspunkt}</Table.DataCell>
                                    <Table.DataCell>
                                        {isSøknadMedEllerUtenBehandling(behandling) && (
                                            <div className={styles.lukketSøknadIkonDataCell}>
                                                <ErrorIcon />
                                                <BodyShort>{formatMessage(behandling.søknad.lukket!.type)}</BodyShort>
                                            </div>
                                        )}
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        {isKlage(behandling) &&
                                            behandling.avsluttet == AvsluttKlageStatus.ER_AVSLUTTET && (
                                                <BodyShort>{behandling.avsluttetBegrunnelse}</BodyShort>
                                            )}
                                        {isSøknadMedEllerUtenBehandling(behandling) &&
                                            skalDokumentIkkeGenereres(behandling.søknad) && (
                                                <BodyShort>{formatMessage('datacell.brev.skalIkkeGenerere')}</BodyShort>
                                            )}
                                        {isSøknadMedEllerUtenBehandling(behandling) &&
                                            erDokumentIkkeGenerertEnda(behandling.søknad) && (
                                                <BodyShort>{formatMessage('datacell.brev.ikkeGenerert')}</BodyShort>
                                            )}

                                        {isSøknadMedEllerUtenBehandling(behandling) &&
                                            erDokumentGenerertEllerSenere(behandling.søknad) && (
                                                <Button
                                                    className={styles.seBrevButton}
                                                    variant="secondary"
                                                    size={'small'}
                                                    loading={RemoteData.isPending(hentDokumenterStatus)}
                                                    onClick={() => {
                                                        hentDokumenter(
                                                            {
                                                                id: behandling.søknad.id,
                                                                idType: DokumentIdType.Søknad,
                                                            },
                                                            (dokumenter) =>
                                                                window.open(
                                                                    URL.createObjectURL(getBlob(dokumenter[0])),
                                                                ),
                                                        );
                                                    }}
                                                >
                                                    <EnvelopeClosedIcon />
                                                </Button>
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
