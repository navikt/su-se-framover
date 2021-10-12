import * as RemoteData from '@devexperts/remote-data-ts';
import { Accordion, Alert, Button, Loader } from '@navikt/ds-react';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import * as personSlice from '~features/person/person.slice';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { useAppDispatch } from '~redux/Store';
import { Restans } from '~types/Restans';
import { formatDateTime } from '~utils/date/dateUtils';

import messages from './restanser-nb';
import styles from './restanser.module.less';
import { AriaSortVerdier, formatRestansStatus, formatRestansType, RestansKolonner, sortTabell } from './restanserUtils';

const Restanser = () => {
    const { formatMessage } = useI18n({ messages });
    const [hentÅpneBehandlingerStatus, hentÅpneBehandlinger] = useAsyncActionCreator(sakSlice.hentRestanser);

    useEffect(() => {
        hentÅpneBehandlinger();
    }, []);

    return pipe(
        hentÅpneBehandlingerStatus,
        RemoteData.fold(
            () => <Loader />,
            () => <Loader />,
            () => <Alert variant="error">{formatMessage('feil.feilOppstod')}</Alert>,
            (restanser: Restans[]) => {
                if (restanser.length === 0) {
                    return <Alert variant="success">{formatMessage('restans.ingenRestanser')}</Alert>;
                }
                return (
                    <Accordion>
                        <Accordion.Item>
                            <Accordion.Header type="button">
                                {formatMessage('åpne.behandlinger.overskrift')}
                            </Accordion.Header>
                            <Accordion.Content>
                                <RestanserTabell tabelldata={restanser} />
                            </Accordion.Content>
                        </Accordion.Item>
                    </Accordion>
                );
            }
        )
    );
};

const KnappOgStatus = (props: { saksnummer: string }) => {
    const [hentSakStatus, hentSak] = useAsyncActionCreator(sakSlice.fetchSak);
    const { formatMessage } = useI18n({ messages });
    const history = useHistory();
    const dispatch = useAppDispatch();

    return (
        <div>
            <Button
                variant="tertiary"
                className={styles.seSakKnapp}
                onClick={async () => {
                    //Siden man kan ha søkt opp en person og/eller før man velger å trykke på hent sak
                    //så resetter vi person og sak slik at når saksbehandler henter sak
                    //gjennom knappene, vil vi hente alt korrekt
                    dispatch(personSlice.default.actions.resetSøker());
                    dispatch(sakSlice.default.actions.resetSak());
                    hentSak({ saksnummer: props.saksnummer }, (sak) => {
                        history.push(
                            Routes.saksoversiktValgtSak.createURL({
                                sakId: sak.id,
                            })
                        );
                    });
                }}
            >
                {formatMessage('sak.seSak')}
                {RemoteData.isPending(hentSakStatus) && <Loader />}
            </Button>
            {RemoteData.isFailure(hentSakStatus) && (
                <Alert variant="error">{formatMessage('feil.sak.kunneIkkeHente')}</Alert>
            )}
        </div>
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

    const getHeaderClassName = (kolonne: RestansKolonner) => {
        return classNames({
            ['tabell__th--sortert-asc']: erKolonneSortertEtter(kolonne) && erSortVerdi('ascending'),
            ['tabell__th--sortert-desc']: erKolonneSortertEtter(kolonne) && erSortVerdi('descending'),
        });
    };

    const getRowClassName = (kolonne: RestansKolonner) => {
        return classNames({ ['tabell__td--sortert']: erKolonneSortertEtter(kolonne) });
    };

    return (
        <div>
            <table className={classNames('tabell', styles.tabell)}>
                <thead>
                    <tr>
                        <th
                            role="columnheader"
                            aria-sort={erKolonneSortertEtter('saksnummer') ? sortVerdi : 'none'}
                            className={getHeaderClassName('saksnummer')}
                        >
                            <button
                                aria-label="Sorter etter saksnummer"
                                onClick={() => onTabellHeaderClick('saksnummer')}
                            >
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
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {sortertTabell.map((restans) => (
                        <tr key={restans.behandlingId}>
                            <td className={getRowClassName('saksnummer')}>{restans.saksnummer}</td>
                            <td className={getRowClassName('typeBehandling')}>
                                {formatRestansType(restans.typeBehandling, formatMessage)}
                            </td>
                            <td className={getRowClassName('status')}>
                                {formatRestansStatus(restans.status, formatMessage)}
                            </td>
                            <td className={getRowClassName('behandlingStartet')}>
                                {restans.behandlingStartet ? formatDateTime(restans.behandlingStartet) : ''}
                            </td>
                            <td>
                                <KnappOgStatus saksnummer={restans.saksnummer} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Restanser;
