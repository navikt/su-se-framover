import * as RemoteData from '@devexperts/remote-data-ts';
import classNames from 'classnames';
import { AlertStripeFeil, AlertStripeSuksess } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { fetchSak, hentÅpneBehandlingerForAlleSaker } from '~features/saksoversikt/sak.slice';
import { formatDateTimeWtihoutIntl } from '~lib/dateUtils';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator, useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { ÅpenBehandling, ÅpenBehandlingStatus, ÅpenBehandlingType } from '~types/Sak';

import messages from './åpneBehandlinger-nb';
import styles from './åpneBehandlinger.module.less';

const formatBehandlingsType = (type: ÅpenBehandlingType, formatMessage: (string: keyof typeof messages) => string) => {
    switch (type) {
        case ÅpenBehandlingType.REVURDERING:
            return formatMessage('behandling.typeBehandling.revurdering');
        case ÅpenBehandlingType.SØKNADSBEHANDLING:
            return formatMessage('behandling.typeBehandling.søknadsbehandling');
    }
};

const formatBehandlignsStatus = (
    status: ÅpenBehandlingStatus,
    formatMessage: (string: keyof typeof messages) => string
) => {
    switch (status) {
        case ÅpenBehandlingStatus.NY_SØKNAD:
            return formatMessage('behandling.status.nySøknad');
        case ÅpenBehandlingStatus.TIL_ATTESTERING:
            return formatMessage('behandling.status.tilAttestering');
        case ÅpenBehandlingStatus.UNDERKJENT:
            return formatMessage('behandling.status.underkjent');
        case ÅpenBehandlingStatus.UNDER_BEHANDLING:
            return formatMessage('behandling.status.underBehandling');
    }
};

const ÅpneBehandlinger = () => {
    const history = useHistory();
    const { formatMessage } = useI18n({ messages });
    const [hentÅpneBehandlingerStatus, hentÅpneBehandlinger] = useAsyncActionCreator(hentÅpneBehandlingerForAlleSaker);
    const [hentSakStatus, hentSak] = useAsyncActionCreator(fetchSak);

    useEffect(() => {
        hentÅpneBehandlinger();
    }, []);

    return (
        <div>
            {pipe(
                hentÅpneBehandlingerStatus,
                RemoteData.fold(
                    () => <NavFrontendSpinner />,
                    () => <NavFrontendSpinner />,
                    () => <AlertStripeFeil>{formatMessage('feil.feilOppstod')}</AlertStripeFeil>,
                    (åpneBehandlinger: ÅpenBehandling[]) => {
                        if (åpneBehandlinger.length === 0) {
                            return (
                                <AlertStripeSuksess>
                                    {formatMessage('behandling.ingenÅpneBehandlinger')}
                                </AlertStripeSuksess>
                            );
                        }
                        return (
                            <div>
                                <table className="tabell">
                                    <caption role="alert" aria-live="polite">
                                        Tabell av åpne behandlinger. Ikke sortert.
                                    </caption>
                                    <thead>
                                        <tr>
                                            <th role="columnheader" aria-sort="none">
                                                <button aria-label="Sorter type behandling">
                                                    {formatMessage('sak.saksnummer')}
                                                </button>
                                            </th>
                                            <th role="columnheader" aria-sort="none">
                                                <button aria-label="Sorter type behandling">
                                                    {formatMessage('behandling.typeBehandling')}
                                                </button>
                                            </th>
                                            <th role="columnheader" aria-sort="none">
                                                <button aria-label="Sorter status">
                                                    {formatMessage('behandling.status')}
                                                </button>
                                            </th>
                                            <th role="columnheader" aria-sort="none">
                                                <button aria-label="Sorter etter opprettet">
                                                    {formatMessage('behandling.opprettet')}
                                                </button>
                                            </th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {åpneBehandlinger.map((åpenBehandling) => (
                                            <tr key={åpenBehandling.behandlingId}>
                                                <td>{åpenBehandling.saksnummer}</td>
                                                <td>
                                                    {formatBehandlingsType(
                                                        åpenBehandling.typeBehandling,
                                                        formatMessage
                                                    )}
                                                </td>
                                                <td>{formatBehandlignsStatus(åpenBehandling.status, formatMessage)}</td>
                                                <td>{formatDateTimeWtihoutIntl(åpenBehandling.opprettet)}</td>
                                                <td>
                                                    <Knapp
                                                        className={classNames(styles.tilSaksoversiktKnapp, '')}
                                                        onClick={async () => {
                                                            hentSak(
                                                                { saksnummer: åpenBehandling.saksnummer },
                                                                (sak) => {
                                                                    history.push(
                                                                        Routes.saksoversiktValgtSak.createURL({
                                                                            sakId: sak.id,
                                                                        })
                                                                    );
                                                                }
                                                            );
                                                        }}
                                                        spinner={RemoteData.isPending(hentSakStatus)}
                                                    >
                                                        {formatMessage('sak.tilSaksoversikt')}
                                                    </Knapp>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {RemoteData.isFailure(hentSakStatus) && (
                                    <AlertStripeFeil>{formatMessage('feil.sak.kunneIkkeHente')}</AlertStripeFeil>
                                )}
                            </div>
                        );
                    }
                )
            )}
        </div>
    );
};

export default ÅpneBehandlinger;
