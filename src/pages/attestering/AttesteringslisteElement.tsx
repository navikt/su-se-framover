import { Knapp } from 'nav-frontend-knapper';
import Panel from 'nav-frontend-paneler';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { Behandling, Behandlingsstatus } from '~api/behandlingApi';
import { Søknad } from '~api/søknadApi';
import { formatDateTime } from '~lib/dateUtils';
import { useI18n } from '~lib/hooks';

import styles from '../saksoversikt/sakintro/sakintro.module.less';

type Props = {
    sakId: string;
    søknad: Søknad;
    behandlinger: Array<Behandling>;
};

const AttesteringslisteElement = (props: Props) => {
    const intl = useI18n({ messages: {} });
    const history = useHistory();
    const { behandlinger, søknad, sakId } = props;

    return (
        <Panel border>
            <div>
                <p>Søknads-id: {søknad.id}</p>
                <p>Innsendt: {formatDateTime(props.søknad.opprettet, intl)}</p>
                {!behandlinger.length && <p>Status: Ikke påbegynt</p>}
            </div>
            {
                <ul>
                    {behandlinger.map((behandling: Behandling) => {
                        return (
                            <li key={behandling.id} className={styles.behandlingListItem}>
                                <div>
                                    <p>Status: {behandling.status}</p>
                                    <p>Behandling påbegynt: {formatDateTime(behandling.opprettet, intl)}</p>
                                </div>
                                {behandling.status == Behandlingsstatus.SIMULERT && (
                                    <Knapp
                                        onClick={() => {
                                            history.push(`/saksoversikt/${sakId}/${behandling.id}/vilkar/`);
                                        }}
                                    >
                                        Start attestering
                                    </Knapp>
                                )}
                            </li>
                        );
                    })}
                </ul>
            }
        </Panel>
    );
};
export default AttesteringslisteElement;
