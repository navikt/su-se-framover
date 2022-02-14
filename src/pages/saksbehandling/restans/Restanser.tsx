import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Loader } from '@navikt/ds-react';
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
                {formatMessage('restans.ingenRestanser')}
            </Alert>
        );
    }

    return (
        <table className={classNames('tabell', styles.tabell)}>
            <thead>
                <tr>
                    <th
                        role="columnheader"
                        aria-sort={erKolonneSortertEtter('saksnummer') ? sortVerdi : 'none'}
                        className={getHeaderClassName('saksnummer')}
                    >
                        <button aria-label="Sorter etter saksnummer" onClick={() => onTabellHeaderClick('saksnummer')}>
                            {formatMessage('sak.saksnummer')}
                        </button>
                    </th>
                    <th
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
                    </th>
                    <th
                        role="columnheader"
                        aria-sort={erKolonneSortertEtter('status') ? sortVerdi : 'none'}
                        className={getHeaderClassName('status')}
                    >
                        <button aria-label="Sorter etter status" onClick={() => onTabellHeaderClick('status')}>
                            {formatMessage('restans.status')}
                        </button>
                    </th>
                    <th
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
                    </th>
                    <th />
                </tr>
            </thead>
            <tbody>
                {sortertTabell.map((restans) => (
                    <tr key={restans.behandlingId}>
                        <td className={getRowClassName('saksnummer')}>{restans.saksnummer}</td>
                        <td className={getRowClassName('typeBehandling')}>{formatMessage(restans.typeBehandling)}</td>
                        <td className={getRowClassName('status')}>{formatMessage(restans.status)}</td>
                        <td className={getRowClassName('behandlingStartet')}>
                            {restans.behandlingStartet ? formatDateTime(restans.behandlingStartet) : ''}
                        </td>
                        <td>
                            <VelgSakKnapp label={formatMessage('sak.seSak')} saksnummer={restans.saksnummer} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default RestanserTabell;
