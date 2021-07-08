import * as RemoteData from '@devexperts/remote-data-ts';
import classNames from 'classnames';
import { AlertStripeFeil, AlertStripeSuksess } from 'nav-frontend-alertstriper';
import { Flatknapp } from 'nav-frontend-knapper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { fetchSak, hentÅpneBehandlingerForAlleSaker } from '~features/saksoversikt/sak.slice';
import { formatDateTime } from '~lib/dateUtils';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator, useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { ÅpenBehandling } from '~types/Sak';

import messages from './åpneBehandlinger-nb';
import styles from './åpneBehandlinger.module.less';
import { formatÅpenBehandlingsType, formatÅpenBehandlignsStatus } from './åpneBehandlingerUtils';

type Kolonner = 'saksnummer' | 'typeBehandling' | 'status' | 'opprettet';
type AriaSortVerdier = 'none' | 'ascending' | 'descending';

const ÅpneBehandlinger = () => {
    const { formatMessage } = useI18n({ messages });
    const [hentÅpneBehandlingerStatus, hentÅpneBehandlinger] = useAsyncActionCreator(hentÅpneBehandlingerForAlleSaker);

    useEffect(() => {
        hentÅpneBehandlinger();
    }, []);

    return pipe(
        hentÅpneBehandlingerStatus,
        RemoteData.fold(
            () => <NavFrontendSpinner />,
            () => <NavFrontendSpinner />,
            () => <AlertStripeFeil>{formatMessage('feil.feilOppstod')}</AlertStripeFeil>,
            (åpneBehandlinger: ÅpenBehandling[]) => {
                if (åpneBehandlinger.length === 0) {
                    return <AlertStripeSuksess>{formatMessage('behandling.ingenÅpneBehandlinger')}</AlertStripeSuksess>;
                }
                return <ÅpneBehandlingerTabell tabelldata={åpneBehandlinger} />;
            }
        )
    );
};

const KnappOgStatus = (props: { saksnummer: string }) => {
    const [hentSakStatus, hentSak] = useAsyncActionCreator(fetchSak);
    const { formatMessage } = useI18n({ messages });
    const history = useHistory();

    return (
        <div>
            <Flatknapp
                className={styles.seSakKnapp}
                onClick={async () => {
                    hentSak({ saksnummer: props.saksnummer }, (sak) => {
                        history.push(
                            Routes.saksoversiktValgtSak.createURL({
                                sakId: sak.id,
                            })
                        );
                    });
                }}
                spinner={RemoteData.isPending(hentSakStatus)}
            >
                {formatMessage('sak.seSak')}
            </Flatknapp>
            {RemoteData.isFailure(hentSakStatus) && (
                <AlertStripeFeil>{formatMessage('feil.sak.kunneIkkeHente')}</AlertStripeFeil>
            )}
        </div>
    );
};

const ÅpneBehandlingerTabell = (props: { tabelldata: ÅpenBehandling[] }) => {
    const { formatMessage } = useI18n({ messages });

    const [tabell, setTabell] = useState<ÅpenBehandling[]>(props.tabelldata);
    const [sortVerdi, setSortVerdi] = useState<AriaSortVerdier>('none');
    const [sortertKolonne, setSortertKolonne] = useState<Kolonner | 'ingen'>('ingen');

    const onTabellHeaderClick = (kolonne: Kolonner) => {
        sort(kolonne);
        setSortertKolonne(kolonne);
    };
    const sort = (kolonne: Kolonner) => {
        const sortert = tabell.slice().sort((a: ÅpenBehandling, b: ÅpenBehandling) => {
            if (sortVerdi === 'ascending') {
                setSortVerdi('descending');
                return a[kolonne] > b[kolonne] ? 1 : a[kolonne] < b[kolonne] ? -1 : 0;
            }
            setSortVerdi('ascending');
            return a[kolonne] > b[kolonne] ? -1 : a[kolonne] < b[kolonne] ? 1 : 0;
        });
        setTabell(sortert);
    };

    return (
        <table className={'tabell'}>
            <caption role="alert" aria-live="polite">
                {formatMessage('tabell.caption')}
            </caption>
            <thead>
                <tr>
                    <th
                        role="columnheader"
                        aria-sort={sortertKolonne === 'saksnummer' ? sortVerdi : 'none'}
                        className={
                            sortertKolonne === 'saksnummer'
                                ? sortVerdi === 'ascending'
                                    ? 'tabell__th--sortert-asc'
                                    : 'tabell__th--sortert-desc'
                                : undefined
                        }
                    >
                        <button aria-label="Sorter saksnummer" onClick={() => onTabellHeaderClick('saksnummer')}>
                            {formatMessage('sak.saksnummer')}
                        </button>
                    </th>
                    <th
                        role="columnheader"
                        aria-sort={sortertKolonne === 'typeBehandling' ? sortVerdi : 'none'}
                        className={
                            sortertKolonne === 'typeBehandling'
                                ? sortVerdi === 'ascending'
                                    ? 'tabell__th--sortert-asc'
                                    : 'tabell__th--sortert-desc'
                                : undefined
                        }
                    >
                        <button
                            aria-label="Sorter type behandling"
                            onClick={() => onTabellHeaderClick('typeBehandling')}
                        >
                            {formatMessage('behandling.typeBehandling')}
                        </button>
                    </th>
                    <th
                        role="columnheader"
                        aria-sort={sortertKolonne === 'status' ? sortVerdi : 'none'}
                        className={
                            sortertKolonne === 'status'
                                ? sortVerdi === 'ascending'
                                    ? 'tabell__th--sortert-asc'
                                    : 'tabell__th--sortert-desc'
                                : undefined
                        }
                    >
                        <button aria-label="Sorter status" onClick={() => onTabellHeaderClick('status')}>
                            {formatMessage('behandling.status')}
                        </button>
                    </th>
                    <th
                        role="columnheader"
                        aria-sort={sortertKolonne === 'opprettet' ? sortVerdi : 'none'}
                        className={
                            sortertKolonne === 'opprettet'
                                ? sortVerdi === 'ascending'
                                    ? 'tabell__th--sortert-asc'
                                    : 'tabell__th--sortert-desc'
                                : undefined
                        }
                    >
                        <button aria-label="Sorter etter opprettet" onClick={() => onTabellHeaderClick('opprettet')}>
                            {formatMessage('behandling.opprettet')}
                        </button>
                    </th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {tabell.map((åpenBehandling) => (
                    <tr key={åpenBehandling.behandlingId}>
                        <td className={classNames({ ['tabell__td--sortert']: sortertKolonne === 'saksnummer' })}>
                            {åpenBehandling.saksnummer}
                        </td>
                        <td className={classNames({ ['tabell__td--sortert']: sortertKolonne === 'typeBehandling' })}>
                            {formatÅpenBehandlingsType(åpenBehandling.typeBehandling, formatMessage)}
                        </td>
                        <td className={classNames({ ['tabell__td--sortert']: sortertKolonne === 'status' })}>
                            {formatÅpenBehandlignsStatus(åpenBehandling.status, formatMessage)}
                        </td>
                        <td className={classNames({ ['tabell__td--sortert']: sortertKolonne === 'opprettet' })}>
                            {formatDateTime(åpenBehandling.opprettet)}
                        </td>
                        <td>
                            <KnappOgStatus saksnummer={åpenBehandling.saksnummer} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default ÅpneBehandlinger;
