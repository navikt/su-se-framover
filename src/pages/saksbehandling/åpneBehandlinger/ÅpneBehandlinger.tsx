import * as RemoteData from '@devexperts/remote-data-ts';
import { AlertStripeFeil, AlertStripeSuksess } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Sidetittel, Undertittel } from 'nav-frontend-typografi';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { fetchSak, hentÅpneBehandlingerForAlleSaker } from '~features/saksoversikt/sak.slice';
import { formatDateTimeWtihoutIntl } from '~lib/dateUtils';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator, useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { ÅpenBehandlingStatus, ÅpenBehandlingType } from '~types/Sak';

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
            <Sidetittel className={styles.sidetittel}>{formatMessage('side.tittel')}</Sidetittel>
            {pipe(
                hentÅpneBehandlingerStatus,
                RemoteData.fold(
                    () => <NavFrontendSpinner />,
                    () => <NavFrontendSpinner />,
                    () => <AlertStripeFeil>{formatMessage('feil.feilOppstod')}</AlertStripeFeil>,
                    (sakerMedÅpneBehandlinger) => {
                        if (sakerMedÅpneBehandlinger.length === 0) {
                            return (
                                <AlertStripeSuksess>
                                    {formatMessage('behandling.ingenÅpneBehandlinger')}
                                </AlertStripeSuksess>
                            );
                        }
                        return (
                            <ul>
                                {sakerMedÅpneBehandlinger.map((sakMedÅpenBehandling) => (
                                    <li
                                        key={sakMedÅpenBehandling.saksnummer}
                                        className={styles.sakMedÅpenBehandlingContainer}
                                    >
                                        <Undertittel>
                                            {formatMessage('sak.saksnummer')}: {sakMedÅpenBehandling.saksnummer}
                                        </Undertittel>

                                        <table className="tabell tabell--stripet">
                                            <thead>
                                                <tr>
                                                    <th>{formatMessage('behandling.typeBehandling')}</th>
                                                    <th>{formatMessage('behandling.status')}</th>
                                                    <th>{formatMessage('behandling.opprettet')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sakMedÅpenBehandling.åpneBehandlinger.map((åpenBehandling, idx) => (
                                                    <tr key={idx}>
                                                        <td>
                                                            {formatBehandlingsType(
                                                                åpenBehandling.typeBehandling,
                                                                formatMessage
                                                            )}
                                                        </td>
                                                        <td>
                                                            {formatBehandlignsStatus(
                                                                åpenBehandling.status,
                                                                formatMessage
                                                            )}
                                                        </td>
                                                        <td>{formatDateTimeWtihoutIntl(åpenBehandling.opprettet)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <Knapp
                                            className={styles.tilSaksoversiktKnapp}
                                            onClick={async () => {
                                                hentSak({ sakId: sakMedÅpenBehandling.saksnummer }, (sak) => {
                                                    history.push(
                                                        Routes.saksoversiktValgtSak.createURL({
                                                            sakId: sak.id,
                                                        })
                                                    );
                                                });
                                            }}
                                            spinner={RemoteData.isPending(hentSakStatus)}
                                        >
                                            {formatMessage('sak.tilSaksoversikt')}
                                        </Knapp>
                                        {RemoteData.isFailure(hentSakStatus) && (
                                            <AlertStripeFeil>
                                                {formatMessage('feil.sak.kunneIkkeHente')}
                                            </AlertStripeFeil>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        );
                    }
                )
            )}
        </div>
    );
};

export default ÅpneBehandlinger;
