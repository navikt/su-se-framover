import * as RemoteData from '@devexperts/remote-data-ts';
import classNames from 'classnames';
import { AlertStripeFeil, AlertStripeSuksess } from 'nav-frontend-alertstriper';
import { Flatknapp } from 'nav-frontend-knapper';
import { Checkbox } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Element, Normaltekst } from 'nav-frontend-typografi';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import * as personSlice from '~features/person/person.slice';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator, useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { useAppDispatch } from '~redux/Store';
import { Restans, RestansStatus, RestansType } from '~types/Restans';
import { formatDateTime } from '~utils/date/dateUtils';

import messages from './restanser-nb';
import styles from './restanser.module.less';
import {
    formatRestansType,
    formatRestansStatus,
    filtrerTabell,
    AriaSortVerdier,
    RestansKolonner,
    sortTabell,
} from './restanserUtils';

const Restanser = () => {
    const { formatMessage } = useI18n({ messages });
    const [hentÅpneBehandlingerStatus, hentÅpneBehandlinger] = useAsyncActionCreator(sakSlice.hentRestanser);

    useEffect(() => {
        hentÅpneBehandlinger();
    }, []);

    return pipe(
        hentÅpneBehandlingerStatus,
        RemoteData.fold(
            () => <NavFrontendSpinner />,
            () => <NavFrontendSpinner />,
            () => <AlertStripeFeil>{formatMessage('feil.feilOppstod')}</AlertStripeFeil>,
            (restanser: Restans[]) => {
                if (restanser.length === 0) {
                    return <AlertStripeSuksess>{formatMessage('restans.ingenRestanser')}</AlertStripeSuksess>;
                }
                return <RestansFiltreringOgTabell tabelldata={restanser} />;
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
            <Flatknapp
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

const RestansFiltreringOgTabell = (props: { tabelldata: Restans[] }) => {
    const { formatMessage } = useI18n({ messages });
    const [filtrerteVerdier] = useState(new Set<RestansStatus | RestansType>());

    const [tabell, setTabell] = useState<Restans[]>(props.tabelldata);

    const handleCheckboxChange = (s: RestansStatus | RestansType) => {
        addOrRemoveFromFiltration(s);
        const filtrertTabell = filtrerTabell(props.tabelldata, filtrerteVerdier);
        setTabell(filtrertTabell);
    };

    const addOrRemoveFromFiltration = (s: RestansStatus | RestansType) => {
        if (filtrerteVerdier.has(s)) {
            filtrerteVerdier.delete(s);
        } else {
            filtrerteVerdier.add(s);
        }
    };

    return (
        <div>
            <div className={styles.checkboxWrapper}>
                <div className={styles.tittelOgCheckboxerContainer}>
                    <Element>{formatMessage('restans.typeBehandling')}</Element>
                    <div className={styles.checkboxContainer}>
                        {Object.values(RestansType).map((t) => (
                            <Checkbox
                                key={t}
                                label={formatMessage(`restans.typeBehandling.${t}`)}
                                onChange={() => handleCheckboxChange(t)}
                            />
                        ))}
                    </div>
                </div>
                <div className={styles.tittelOgCheckboxerContainer}>
                    <Element>{formatMessage('restans.status')}</Element>
                    <div className={styles.checkboxContainer}>
                        {Object.values(RestansStatus).map((s) => (
                            <Checkbox
                                key={s}
                                label={formatMessage(`restans.status.${s}`)}
                                onChange={() => handleCheckboxChange(s)}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <RestanserTabell tabelldata={tabell} />
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
                <caption role="alert" aria-live="polite">
                    {formatMessage('tabell.caption')}
                </caption>
                <thead>
                    <tr>
                        <th
                            role="columnheader"
                            aria-sort={erKolonneSortertEtter('saksnummer') ? sortVerdi : 'none'}
                            className={getHeaderClassName('saksnummer')}
                        >
                            <button aria-label="Sorter saksnummer" onClick={() => onTabellHeaderClick('saksnummer')}>
                                {formatMessage('sak.saksnummer')}
                            </button>
                        </th>
                        <th
                            role="columnheader"
                            aria-sort={erKolonneSortertEtter('typeBehandling') ? sortVerdi : 'none'}
                            className={getHeaderClassName('typeBehandling')}
                        >
                            <button
                                aria-label="Sorter type behandling"
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
                            <button aria-label="Sorter status" onClick={() => onTabellHeaderClick('status')}>
                                {formatMessage('restans.status')}
                            </button>
                        </th>
                        <th
                            role="columnheader"
                            aria-sort={erKolonneSortertEtter('opprettet') ? sortVerdi : 'none'}
                            className={getHeaderClassName('opprettet')}
                        >
                            <button
                                aria-label="Sorter etter opprettet"
                                onClick={() => onTabellHeaderClick('opprettet')}
                            >
                                {formatMessage('restans.opprettet')}
                            </button>
                        </th>
                        <th>
                            <Normaltekst className={styles.antallSakerHeaderTekst}>
                                {formatMessage('tabell.antallSaker')} {sortertTabell.length}
                            </Normaltekst>
                        </th>
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
                            <td className={getRowClassName('opprettet')}>{formatDateTime(restans.opprettet)}</td>
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
