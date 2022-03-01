import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Loader, Table } from '@navikt/ds-react';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
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
import { AriaSortVerdier, RestansKolonner, sortTabell } from './restanserUtils';

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

    const [sortertTabell, setSortertTabell] = useState<Restans[]>(props.tabelldata);
    const [sortVerdi, setSortVerdi] = useState<AriaSortVerdier>('none');
    const [sortertKolonne, setSortertKolonne] = useState<RestansKolonner | 'ingen'>('ingen');

    const erKolonneSortertEtter = (k: RestansKolonner) => k === sortertKolonne;
    const erSortVerdi = (s: AriaSortVerdier) => s === sortVerdi;

    const onTabellHeaderClick = async (kolonne: RestansKolonner) => {
        const currentSortVerdi = getCurrentSortVerdi();
        const sortert = sortTabell(props.tabelldata, kolonne, currentSortVerdi);
        setSortertTabell(sortert);
        setSortertKolonne(kolonne);
    };

    const getCurrentSortVerdi = (): AriaSortVerdier => {
        if (erSortVerdi('ascending')) {
            setSortVerdi('descending');
            return 'descending';
        }

        setSortVerdi('ascending');
        return 'ascending';
    };

    useEffect(() => {
        if (erSortVerdi('none')) {
            setSortertTabell(props.tabelldata);
        } else {
            const sortert = sortTabell(props.tabelldata, sortertKolonne, sortVerdi);
            setSortertTabell(sortert);
        }
    }, [props.tabelldata]);

    const getHeaderClassName = (kolonne: RestansKolonner) =>
        classNames({
            ['tabell__th--sortert-asc']: erKolonneSortertEtter(kolonne) && erSortVerdi('ascending'),
            ['tabell__th--sortert-desc']: erKolonneSortertEtter(kolonne) && erSortVerdi('descending'),
        });

    const getRowClassName = (kolonne: RestansKolonner) =>
        classNames({ ['tabell__td--sortert']: erKolonneSortertEtter(kolonne) });

    if (props.tabelldata.length === 0) {
        return (
            <Alert variant="info" className={styles.ingenResultater}>
                {formatMessage('restans.ingenBehandlinger')}
            </Alert>
        );
    }

    return (
        <Table className={classNames('tabell', styles.tabell)}>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell
                        role="columnheader"
                        aria-sort={erKolonneSortertEtter('saksnummer') ? sortVerdi : 'none'}
                        className={getHeaderClassName('saksnummer')}
                    >
                        <button aria-label="Sorter etter saksnummer" onClick={() => onTabellHeaderClick('saksnummer')}>
                            {formatMessage('sak.saksnummer')}
                        </button>
                    </Table.HeaderCell>
                    <Table.HeaderCell
                        role="columnheader"
                        aria-sort={erKolonneSortertEtter('typeBehandling') ? sortVerdi : 'none'}
                        className={getHeaderClassName('typeBehandling')}
                    >
                        <button
                            aria-label="Sorter etter type behandling"
                            onClick={() => onTabellHeaderClick('typeBehandling')}
                        >
                            {formatMessage('restans.typeBehandling')}
                        </button>
                    </Table.HeaderCell>
                    <Table.HeaderCell
                        role="columnheader"
                        aria-sort={erKolonneSortertEtter('status') ? sortVerdi : 'none'}
                        className={getHeaderClassName('status')}
                    >
                        <button aria-label="Sorter etter status" onClick={() => onTabellHeaderClick('status')}>
                            {formatMessage('restans.status')}
                        </button>
                    </Table.HeaderCell>
                    <Table.HeaderCell
                        role="columnheader"
                        aria-sort={erKolonneSortertEtter('behandlingStartet') ? sortVerdi : 'none'}
                        className={getHeaderClassName('behandlingStartet')}
                    >
                        <button
                            aria-label="Sorter etter når behandling startet"
                            onClick={() => onTabellHeaderClick('behandlingStartet')}
                        >
                            {formatMessage('restans.behandling.startet')}
                        </button>
                    </Table.HeaderCell>
                    <Table.HeaderCell />
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {sortertTabell.map((restans) => (
                    <Table.Row key={restans.behandlingId}>
                        <Table.DataCell className={getRowClassName('saksnummer')}>{restans.saksnummer}</Table.DataCell>
                        <Table.DataCell className={getRowClassName('typeBehandling')}>
                            {formatMessage(restans.typeBehandling)}
                        </Table.DataCell>
                        <Table.DataCell className={getRowClassName('status')}>
                            {formatMessage(restans.status)}
                        </Table.DataCell>
                        <Table.DataCell className={getRowClassName('behandlingStartet')}>
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
