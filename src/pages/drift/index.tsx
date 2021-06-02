import * as RemoteData from '@devexperts/remote-data-ts';
import AlertStripe from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import 'nav-frontend-tabell-style';
import * as React from 'react';

import { ApiError } from '~api/apiClient';
import {
    fetchBakoverStatus,
    patchIverksettinger,
    patchSøknader,
    SøknadResponse,
    IverksettResponse,
} from '~api/driftApi';

import styles from './index.module.less';

const Rad = (props: {
    type: 'Journalpost' | 'Oppgave' | 'Brevbestilling';
    status: 'OK' | 'FEIL';
    sakId: string;
    id: string;
    søknadId?: string;
    behandlingId?: string;
}) => {
    return (
        <tr>
            <td>{props.type}</td>
            <td>{props.status}</td>
            <td className={styles.tabelldata}>{props.sakId}</td>
            <td className={styles.tabelldata}>{props.id}</td>
            <td className={styles.tabelldata}>{props.søknadId ?? props.behandlingId}</td>
        </tr>
    );
};

const SøknadTabell = (props: { søknadResponse: SøknadResponse }) => {
    return (
        <table className="tabell">
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Sakid</th>
                    <th>Id</th>
                    <th>Søknadid</th>
                </tr>
            </thead>
            <tbody>
                {props.søknadResponse.journalposteringer.ok.map((journalpost) => (
                    <Rad
                        key={journalpost.journalpostId}
                        type="Journalpost"
                        status="OK"
                        sakId={journalpost.sakId}
                        søknadId={journalpost.søknadId}
                        id={journalpost.journalpostId}
                    />
                ))}
                {props.søknadResponse.journalposteringer.feilet.map((journalpost, index) => (
                    <Rad
                        key={index}
                        type="Journalpost"
                        status="FEIL"
                        sakId={journalpost.sakId}
                        søknadId={journalpost.søknadId}
                        id={journalpost.grunn}
                    />
                ))}
                {props.søknadResponse.oppgaver.ok.map((oppgave) => (
                    <Rad
                        key={oppgave.oppgaveId}
                        type="Oppgave"
                        status="OK"
                        sakId={oppgave.sakId}
                        søknadId={oppgave.søknadId}
                        id={oppgave.oppgaveId}
                    />
                ))}
                {props.søknadResponse.oppgaver.feilet.map((oppgave, index) => (
                    <Rad
                        key={index}
                        type="Oppgave"
                        status="FEIL"
                        sakId={oppgave.sakId}
                        søknadId={oppgave.søknadId}
                        id={oppgave.grunn}
                    />
                ))}
            </tbody>
        </table>
    );
};

const IverksettTabell = (props: { iverksettResponse: IverksettResponse }) => {
    return (
        <table className="tabell">
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Sakid</th>
                    <th>Id</th>
                    <th>BehandlingId</th>
                </tr>
            </thead>
            <tbody>
                {props.iverksettResponse.journalposteringer.ok.map((journalpost) => (
                    <Rad
                        key={journalpost.journalpostId}
                        type="Journalpost"
                        status="OK"
                        sakId={journalpost.sakId}
                        behandlingId={journalpost.behandlingId}
                        id={journalpost.journalpostId}
                    />
                ))}
                {props.iverksettResponse.journalposteringer.feilet.map((journalpost, index) => (
                    <Rad
                        key={index}
                        type="Journalpost"
                        status="FEIL"
                        sakId={journalpost.sakId}
                        behandlingId={journalpost.behandlingId}
                        id={journalpost.grunn}
                    />
                ))}
                {props.iverksettResponse.brevbestillinger.ok.map((brevbestilling) => (
                    <Rad
                        key={brevbestilling.brevbestillingId}
                        type="Brevbestilling"
                        status="OK"
                        sakId={brevbestilling.sakId}
                        behandlingId={brevbestilling.behandlingId}
                        id={brevbestilling.brevbestillingId}
                    />
                ))}
                {props.iverksettResponse.brevbestillinger.feilet.map((brevbestilling, index) => (
                    <Rad
                        key={index}
                        type="Brevbestilling"
                        status="FEIL"
                        sakId={brevbestilling.sakId}
                        behandlingId={brevbestilling.behandlingId}
                        id={brevbestilling.grunn}
                    />
                ))}
            </tbody>
        </table>
    );
};

const Drift = () => {
    const [statusBakover, setStatusBakover] = React.useState<RemoteData.RemoteData<ApiError, string>>(
        RemoteData.initial
    );
    React.useEffect(() => {
        const hentStatus = async () => {
            const resultat = await fetchBakoverStatus();
            if (resultat.status === 'ok') {
                setStatusBakover(RemoteData.success(resultat.data));
            } else {
                setStatusBakover(RemoteData.failure(resultat.error));
            }
        };
        hentStatus();
    }, []);

    const [fixSøknaderResponse, setfixSøknaderResponse] = React.useState<
        RemoteData.RemoteData<ApiError, SøknadResponse>
    >(RemoteData.initial);

    const fixSøknader = async () => {
        const resultat = await patchSøknader();
        if (resultat.status === 'ok') {
            setfixSøknaderResponse(RemoteData.success(resultat.data));
        } else {
            setfixSøknaderResponse(RemoteData.failure(resultat.error));
        }
    };

    const [fixIverksettingResponse, setfixIverksettingResponse] = React.useState<
        RemoteData.RemoteData<ApiError, IverksettResponse>
    >(RemoteData.initial);

    const fixIverksettinger = async () => {
        const resultat = await patchIverksettinger();
        if (resultat.status === 'ok') {
            setfixIverksettingResponse(RemoteData.success(resultat.data));
        } else {
            setfixIverksettingResponse(RemoteData.failure(resultat.error));
        }
    };

    return (
        <div className={styles.container}>
            <div>
                <h1 className={styles.header}>Drift</h1>
            </div>

            <div>
                <h1 className={styles.header}>Status</h1>
                <div className={styles.statusContainer}>
                    {RemoteData.isSuccess(statusBakover) ? (
                        <AlertStripe className={styles.alert} type="suksess">
                            Bakover er oppe
                        </AlertStripe>
                    ) : (
                        <AlertStripe className={styles.alert} type="feil">
                            Bakover er nede
                        </AlertStripe>
                    )}
                </div>
            </div>
            <div>
                <h1 className={styles.header}>Actions</h1>
                <div className={styles.actionsContainer}>
                    <Knapp
                        className={styles.knapp}
                        htmlType="button"
                        onClick={fixSøknader}
                        spinner={RemoteData.isPending(fixSøknaderResponse)}
                    >
                        Fix Søknader
                    </Knapp>

                    <Knapp
                        className={styles.knapp}
                        htmlType="button"
                        onClick={fixIverksettinger}
                        spinner={RemoteData.isPending(fixIverksettingResponse)}
                    >
                        Fix Iverksettinger
                    </Knapp>
                </div>
                {RemoteData.isFailure(fixSøknaderResponse) && (
                    <AlertStripe className={styles.alert} type="feil">
                        Fix Søknader feilet
                        {fixSøknaderResponse.error.statusCode}
                        {fixSøknaderResponse.error.body?.message}
                    </AlertStripe>
                )}
                {RemoteData.isFailure(fixIverksettingResponse) && (
                    <AlertStripe className={styles.alert} type="feil">
                        Fix Iverksettinger feilet
                        {fixIverksettingResponse.error.statusCode}
                        {fixIverksettingResponse.error.body?.message}
                    </AlertStripe>
                )}
                <div className={styles.tabellContainer}>
                    {RemoteData.isSuccess(fixSøknaderResponse) && (
                        <div>
                            <SøknadTabell søknadResponse={fixSøknaderResponse.value} />
                        </div>
                    )}
                    {RemoteData.isSuccess(fixIverksettingResponse) && (
                        <div>
                            <IverksettTabell iverksettResponse={fixIverksettingResponse.value} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Drift;
