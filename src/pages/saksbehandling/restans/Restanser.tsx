import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Loader, Table } from '@navikt/ds-react';
import classNames from 'classnames';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import * as personSlice from '~features/person/person.slice';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { useAppDispatch } from '~redux/Store';
import { Restans } from '~types/Restans';
import { formatDateTime } from '~utils/date/dateUtils';

import messages from './restanser-nb';
import styles from './restanser.module.less';
import { AriaSortVerdi, RestansKolonne, sortTabell } from './restanserUtils';

const VelgSakKnapp = (props: { label: string; saksnummer: string }) => {
    const [hentSakStatus, hentSak] = useAsyncActionCreator(sakSlice.fetchSak);
    const { push } = useHistory();
    const dispatch = useAppDispatch();

    return (
        <Button
            variant="tertiary"
            onClick={async () => {
                dispatch(personSlice.default.actions.resetSøker());
                dispatch(sakSlice.default.actions.resetSak());
                hentSak({ saksnummer: props.saksnummer }, (sak) => {
                    push(Routes.saksoversiktValgtSak.createURL({ sakId: sak.id }));
                });
            }}
        >
            {props.label}
            {RemoteData.isPending(hentSakStatus) && <Loader />}
        </Button>
    );
};

const RestanserTabell = (props: { tabelldata: Restans[] }) => {
    const { formatMessage } = useI18n({ messages });

    const [sortVerdi, setSortVerdi] = useState<AriaSortVerdi>();
    const [sortertKolonne, setSortertKolonne] = useState<RestansKolonne>();

    const handleSorterClick = (kolonne: RestansKolonne) => {
        if (sortertKolonne !== kolonne) {
            setSortertKolonne(kolonne);
            setSortVerdi('ascending');
            return;
        }

        setSortVerdi(nesteSortVerdi(sortVerdi));
    };

    const nesteSortVerdi = (sortVerdi?: AriaSortVerdi) => {
        switch (sortVerdi) {
            case undefined:
                return 'ascending';
            case 'ascending':
                return 'descending';
            case 'descending':
                return undefined;
        }
    };

    if (props.tabelldata.length === 0) {
        return (
            <Alert variant="info" className={styles.ingenResultater}>
                {formatMessage('restans.ingenBehandlinger')}
            </Alert>
        );
    }

    return (
        <Table
            className={classNames('tabell', styles.tabell, 'navds-table')}
            sort={sortVerdi && sortertKolonne ? { orderBy: sortertKolonne, direction: sortVerdi } : undefined}
            onSortChange={(sortKey) => {
                handleSorterClick(sortKey as RestansKolonne);
            }}
        >
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
        </Table>
    );
};

export default RestanserTabell;
