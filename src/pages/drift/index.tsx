import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Loader, Modal } from '@navikt/ds-react';
import * as React from 'react';
import { useState } from 'react';
import DatePicker from 'react-datepicker';

import { ApiError } from '~api/apiClient';
import {
    fetchBakoverStatus,
    patchSøknader,
    SøknadResponse,
    konsistensavstemming,
    hentReguleringer,
} from '~api/driftApi';
import { useApiCall } from '~lib/hooks';
import { Nullable } from '~lib/types';
import Nøkkeltall from '~pages/saksbehandling/behandlingsoversikt/nøkkeltall/Nøkkeltall';
import { toIsoDateOnlyString } from '~utils/date/dateUtils';

import GReguleringTabell from './components/GReguleringTabell';
import { SøknadTabellDrift } from './components/SøknadTabell';
import styles from './index.module.less';

enum Knapp {
    FIX_SØKNADER,
    KAST_EN_FEIL,
    KONSISTENSAVSTEMMING,
    G_REGULERING,
    NØKKELTALL,
}

const Drift = () => {
    const [knappTrykket, settKnappTrykket] = useState<Nullable<Knapp>>();
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

    const [GReguleringsdata, hentGReguleringsdata] = useApiCall(hentReguleringer);
    const [fixSøknaderResponse, setfixSøknaderResponse] = React.useState<
        RemoteData.RemoteData<ApiError, SøknadResponse>
    >(RemoteData.initial);

    const fixSøknader = async () => {
        settKnappTrykket(Knapp.FIX_SØKNADER);
        const resultat = await patchSøknader();
        if (resultat.status === 'ok') {
            setfixSøknaderResponse(RemoteData.success(resultat.data));
        } else {
            setfixSøknaderResponse(RemoteData.failure(resultat.error));
        }
    };

    const [konsistensavtemmingModalOpen, setKonsistensavtemmingModalOpen] = React.useState(false);
    const [konsistensavstemmingFraOgMed, setKonsistensavstemmingFraOgMed] = React.useState<Date>(new Date());
    const [konsistensavstemmingStatus, fetchKonsistensavstemming] = useApiCall(konsistensavstemming);

    return (
        <div className={styles.container}>
            <div>
                <h1 className={styles.header}>Drift</h1>
            </div>

            <div>
                <h1 className={styles.header}>Status</h1>
                <div className={styles.statusContainer}>
                    {RemoteData.isSuccess(statusBakover) ? (
                        <Alert className={styles.alert} variant="success">
                            Bakover er oppe
                        </Alert>
                    ) : (
                        <Alert className={styles.alert} variant="error">
                            Bakover er nede
                        </Alert>
                    )}
                </div>
            </div>
            <div>
                <h1 className={styles.header}>Actions</h1>
                <div className={styles.actionsContainer}>
                    <Button variant="secondary" className={styles.knapp} type="button" onClick={fixSøknader}>
                        Fix Søknader
                        {RemoteData.isPending(fixSøknaderResponse) && <Loader />}
                    </Button>
                    <Button
                        variant="secondary"
                        className={styles.knapp}
                        type="button"
                        onClick={() => {
                            throw Error('Feil som ble trigget manuelt fra driftssiden');
                        }}
                    >
                        Kast en feil
                    </Button>

                    <Button
                        variant="secondary"
                        className={styles.knapp}
                        type="button"
                        onClick={() => setKonsistensavtemmingModalOpen(true)}
                    >
                        Konsistensavstemming
                        {RemoteData.isPending(konsistensavstemmingStatus) && <Loader />}
                    </Button>
                    <Modal
                        open={konsistensavtemmingModalOpen}
                        onClose={() => {
                            setKonsistensavtemmingModalOpen(false);
                        }}
                    >
                        <Modal.Content>
                            <div className={styles.modalContainer}>
                                <DatePicker
                                    dateFormat="dd/MM/yyyy"
                                    selected={konsistensavstemmingFraOgMed}
                                    onChange={(date: Date) => {
                                        setKonsistensavstemmingFraOgMed(date);
                                    }}
                                ></DatePicker>
                                <Button
                                    variant="secondary"
                                    className={styles.knapp}
                                    type="button"
                                    onClick={() => {
                                        settKnappTrykket(Knapp.KONSISTENSAVSTEMMING);
                                        fetchKonsistensavstemming(toIsoDateOnlyString(konsistensavstemmingFraOgMed));
                                    }}
                                >
                                    Konsistensavstemming
                                    {RemoteData.isPending(konsistensavstemmingStatus) && <Loader />}
                                </Button>
                            </div>
                        </Modal.Content>
                    </Modal>
                    <Button
                        variant="secondary"
                        className={styles.knapp}
                        type="button"
                        onClick={() => {
                            hentGReguleringsdata({});
                            settKnappTrykket(Knapp.G_REGULERING);
                        }}
                    >
                        G-regulering
                    </Button>
                    <Button
                        variant="secondary"
                        className={styles.knapp}
                        type="button"
                        onClick={() => settKnappTrykket(Knapp.NØKKELTALL)}
                    >
                        Nøkkeltall
                    </Button>
                </div>
                {knappTrykket === Knapp.FIX_SØKNADER && RemoteData.isFailure(fixSøknaderResponse) && (
                    <Alert className={styles.alert} variant="error">
                        <p>Fix Søknader feilet</p>
                        {fixSøknaderResponse.error.statusCode}
                        <p>
                            {fixSøknaderResponse.error.body?.message ?? JSON.stringify(fixSøknaderResponse.error.body)}
                        </p>
                    </Alert>
                )}
                {knappTrykket === Knapp.G_REGULERING && RemoteData.isFailure(GReguleringsdata) && (
                    <Alert className={styles.alert} variant="error">
                        <p>Henting av G-reguleringsresultat feilet</p>
                        Feilkode: {GReguleringsdata.error?.statusCode}
                    </Alert>
                )}
                <div className={styles.tabellContainer}>
                    {knappTrykket === Knapp.FIX_SØKNADER && RemoteData.isSuccess(fixSøknaderResponse) && (
                        <div>
                            <SøknadTabellDrift søknadResponse={fixSøknaderResponse.value} />
                        </div>
                    )}
                    {knappTrykket === Knapp.KONSISTENSAVSTEMMING && RemoteData.isSuccess(konsistensavstemmingStatus) && (
                        <Alert className={styles.alert} variant="success">
                            <p>{JSON.stringify(konsistensavstemmingStatus.value)}</p>
                        </Alert>
                    )}
                </div>
                {knappTrykket === Knapp.G_REGULERING && RemoteData.isSuccess(GReguleringsdata) && (
                    <GReguleringTabell data={GReguleringsdata.value.saker} />
                )}
                {knappTrykket === Knapp.NØKKELTALL && <Nøkkeltall />}
            </div>
        </div>
    );
};

export default Drift;
