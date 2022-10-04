import { Alert, Table } from '@navikt/ds-react';
import React from 'react';

import SuTabell from '~src/components/tabell/SuTabell';
import VelgSakKnapp from '~src/components/velgSakKnapp/velgSakKnapp';
import { useI18n } from '~src/lib/i18n';
import { Restans } from '~src/types/Restans';
import { formatDateTime } from '~src/utils/date/dateUtils';

import messages from './restanser-nb';
import * as styles from './restanser.module.less';
import { RestansKolonne, sortTabell } from './restanserUtils';

const RestanserTabell = (props: { tabelldata: Restans[] }) => {
    const { formatMessage } = useI18n({ messages });

    if (props.tabelldata.length === 0) {
        return (
            <Alert variant="info" className={styles.ingenResultater}>
                {formatMessage('restans.ingenBehandlinger')}
            </Alert>
        );
    }

    return (
        <SuTabell
            kolonnerConfig={{
                kolonner: RestansKolonne,
                defaultKolonneSorteresEtter: RestansKolonne.behandlingStartet,
            }}
            tableHeader={() => (
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader sortKey="saksnummer" sortable>
                            {formatMessage('sak.saksnummer')}
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortKey="typeBehandling" sortable>
                            {formatMessage('restans.typeBehandling')}
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortKey="status" sortable>
                            {formatMessage('restans.status')}
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortKey="behandlingStartet" sortable>
                            {formatMessage('restans.behandling.startet')}
                        </Table.ColumnHeader>
                        <Table.HeaderCell />
                    </Table.Row>
                </Table.Header>
            )}
            tableBody={(sortertKolonne, sortVerdi) => (
                <Table.Body>
                    {sortTabell(props.tabelldata, sortertKolonne, sortVerdi).map((restans) => (
                        <Table.Row key={restans.behandlingId}>
                            <Table.DataCell>{restans.saksnummer}</Table.DataCell>
                            <Table.DataCell>{formatMessage(restans.typeBehandling)}</Table.DataCell>
                            <Table.DataCell>{formatMessage(restans.status)}</Table.DataCell>
                            <Table.DataCell>
                                {restans.behandlingStartet ? formatDateTime(restans.behandlingStartet) : ''}
                            </Table.DataCell>
                            <Table.DataCell>
                                <VelgSakKnapp label={formatMessage('sak.seSak')} saksnummer={restans.saksnummer} />
                            </Table.DataCell>
                        </Table.Row>
                    ))}
                </Table.Body>
            )}
        />
    );
};

export default RestanserTabell;
