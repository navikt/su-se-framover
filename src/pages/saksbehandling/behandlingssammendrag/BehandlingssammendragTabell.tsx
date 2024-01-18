import { Alert, Table } from '@navikt/ds-react';

import SuTabell from '~src/components/tabell/SuTabell';
import VelgSakKnapp from '~src/components/velgSakKnapp/velgSakKnapp';
import { useI18n } from '~src/lib/i18n';
import { Behandlingssammendrag } from '~src/types/Behandlingssammendrag';
import { formatDateTime, formatPeriode } from '~src/utils/date/dateUtils';

import messages from './Behandlingssammendrag-nb';
import * as styles from './Behandlingssammendrag.module.less';
import { BehandlingssammendragKolonne, sortTabell } from './BehandlingssammendragUtils';

const BehandlingssammendragTabell = (props: { tabelldata: Behandlingssammendrag[] }) => {
    const { formatMessage } = useI18n({ messages });

    if (props.tabelldata.length === 0) {
        return (
            <Alert variant="info" className={styles.ingenResultater}>
                {formatMessage('behandlingssammendrag.ingenBehandlinger')}
            </Alert>
        );
    }

    return (
        <SuTabell
            kolonnerConfig={{
                kolonner: BehandlingssammendragKolonne,
                defaultKolonneSorteresEtter: BehandlingssammendragKolonne.behandlingStartet,
            }}
            tableHeader={() => (
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader sortKey="saksnummer" sortable>
                            {formatMessage('sak.saksnummer')}
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortKey="typeBehandling" sortable>
                            {formatMessage('behandlingssammendrag.typeBehandling')}
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortKey="status" sortable>
                            {formatMessage('behandlingssammendrag.status')}
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortKey="periode" sortable>
                            {formatMessage('behandlingssammendrag.periode')}
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortKey="behandlingStartet" sortable>
                            {formatMessage('behandlingssammendrag.behandling.startet')}
                        </Table.ColumnHeader>
                        <Table.HeaderCell />
                    </Table.Row>
                </Table.Header>
            )}
            tableBody={(sortertKolonne, sortVerdi) => (
                <Table.Body>
                    {sortTabell(props.tabelldata, sortertKolonne, sortVerdi).map((behandlingssammendrag) => (
                        <Table.Row key={behandlingssammendrag.behandlingId}>
                            <Table.DataCell>{behandlingssammendrag.saksnummer}</Table.DataCell>
                            <Table.DataCell>{formatMessage(behandlingssammendrag.typeBehandling)}</Table.DataCell>
                            <Table.DataCell>{formatMessage(behandlingssammendrag.status)}</Table.DataCell>
                            <Table.DataCell>
                                {behandlingssammendrag.periode ? formatPeriode(behandlingssammendrag.periode) : ''}
                            </Table.DataCell>
                            <Table.DataCell>
                                {behandlingssammendrag.behandlingStartet
                                    ? formatDateTime(behandlingssammendrag.behandlingStartet)
                                    : ''}
                            </Table.DataCell>
                            <Table.DataCell>
                                <VelgSakKnapp
                                    label={formatMessage('sak.seSak')}
                                    saksnummer={behandlingssammendrag.saksnummer}
                                />
                            </Table.DataCell>
                        </Table.Row>
                    ))}
                </Table.Body>
            )}
        />
    );
};

export default BehandlingssammendragTabell;
