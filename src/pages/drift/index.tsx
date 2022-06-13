import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Loader, Modal, Select } from '@navikt/ds-react';
import * as React from 'react';
import { useState } from 'react';
import DatePicker from 'react-datepicker';

import { ApiError } from '~src/api/apiClient';
import {
    fetchBakoverStatus,
    patchSøknader,
    SøknadResponse,
    konsistensavstemming,
    grensesnittsavstemming,
} from '~src/api/driftApi';
import { useApiCall } from '~src/lib/hooks';
import { Nullable } from '~src/lib/types';
import Nøkkeltall from '~src/pages/saksbehandling/behandlingsoversikt/nøkkeltall/Nøkkeltall';
import { toIsoDateOnlyString } from '~src/utils/date/dateUtils';

import StartGRegulering from './components/StartGRegulering';
import { SøknadTabellDrift } from './components/SøknadTabell';
import * as styles from './index.module.less';

enum Knapp {
    FIX_SØKNADER,
    KAST_EN_FEIL,
    GRENSESNITTSAVSTEMMING,
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

    const [visReguleringModal, setVisReguleringModal] = React.useState(false);
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

    const [grensesnittsavstemmingModalOpen, setGrensesnittsavstemmingModalOpen] = React.useState(false);
    const [grensesnittsavtemmingFraOgMed, setGrensesnittsavtemmingFraOgMed] = React.useState<Date>(new Date());
    const [grensesnittsavtemmingTilOgMed, setGrensesnittsavtemmingTilOgMed] = React.useState<Date>(new Date());
    const [grensesnittsavstemmingStatus, fetchGrensesnittsavstemming] = useApiCall(grensesnittsavstemming);
    const [grensesnittsavstemmingFagområde, setGrensesnittsavstemmingFagområde] = React.useState<string>('SUUFORE');

    const [konsistensavtemmingModalOpen, setKonsistensavtemmingModalOpen] = React.useState(false);
    const [konsistensavstemmingFraOgMed, setKonsistensavstemmingFraOgMed] = React.useState<Date>(new Date());
    const [konsistensavstemmingStatus, fetchKonsistensavstemming] = useApiCall(konsistensavstemming);
    const [konsistensavstemmingFagområde, setKonsistensavstemmingFagområde] = React.useState<string>('SUUFORE');

    return (
        <div className={styles.container}>
            <div>
                <h1>Drift</h1>
            </div>

            <div>
                <h1>Status</h1>
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
                <h1>Actions</h1>
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
                        onClick={() => setGrensesnittsavstemmingModalOpen(true)}
                    >
                        Grensesnittsavstemming
                        {RemoteData.isPending(grensesnittsavstemmingStatus) && <Loader />}
                    </Button>
                    <Modal
                        open={grensesnittsavstemmingModalOpen}
                        onClose={() => {
                            setGrensesnittsavstemmingModalOpen(false);
                        }}
                    >
                        <Modal.Content>
                            <div className={styles.modalContainer}>
                                <DatePicker
                                    dateFormat="dd/MM/yyyy"
                                    selected={grensesnittsavtemmingFraOgMed}
                                    onChange={(date: Date) => {
                                        setGrensesnittsavtemmingFraOgMed(date);
                                    }}
                                ></DatePicker>
                                <DatePicker
                                    dateFormat="dd/MM/yyyy"
                                    selected={grensesnittsavtemmingTilOgMed}
                                    onChange={(date: Date) => {
                                        setGrensesnittsavtemmingTilOgMed(date);
                                    }}
                                ></DatePicker>
                                <Select
                                    label={'Fagområde'}
                                    value={grensesnittsavstemmingFagområde}
                                    onChange={(e) => setGrensesnittsavstemmingFagområde(e.target.value)}
                                >
                                    <option value="SUUFORE">{'UFØRE'}</option>
                                    <option value="SUALDER">{'ALDER'}</option>
                                </Select>
                                <Button
                                    variant="secondary"
                                    className={styles.knapp}
                                    type="button"
                                    onClick={() => {
                                        settKnappTrykket(Knapp.GRENSESNITTSAVSTEMMING);
                                        fetchGrensesnittsavstemming({
                                            fraOgMed: toIsoDateOnlyString(grensesnittsavtemmingFraOgMed),
                                            tilOgMed: toIsoDateOnlyString(grensesnittsavtemmingTilOgMed),
                                            fagområde: grensesnittsavstemmingFagområde,
                                        });
                                    }}
                                >
                                    Grensesnittsavstemming
                                    {RemoteData.isPending(grensesnittsavstemmingStatus) && <Loader />}
                                </Button>
                            </div>
                        </Modal.Content>
                    </Modal>
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
                                <Select
                                    label={'Fagområde'}
                                    value={konsistensavstemmingFagområde}
                                    onChange={(e) => setKonsistensavstemmingFagområde(e.target.value)}
                                >
                                    <option value="SUUFORE">{'UFØRE'}</option>
                                    <option value="SUALDER">{'ALDER'}</option>
                                </Select>
                                <Button
                                    variant="secondary"
                                    className={styles.knapp}
                                    type="button"
                                    onClick={() => {
                                        settKnappTrykket(Knapp.KONSISTENSAVSTEMMING);
                                        fetchKonsistensavstemming({
                                            fraOgMed: toIsoDateOnlyString(konsistensavstemmingFraOgMed),
                                            fagområde: konsistensavstemmingFagområde,
                                        });
                                    }}
                                >
                                    Konsistensavstemming
                                    {RemoteData.isPending(konsistensavstemmingStatus) && <Loader />}
                                </Button>
                            </div>
                        </Modal.Content>
                    </Modal>
                    <Modal
                        aria-labelledby="Start regulering"
                        open={visReguleringModal}
                        onClose={() => setVisReguleringModal(false)}
                    >
                        <Modal.Content>
                            <StartGRegulering />
                        </Modal.Content>
                    </Modal>
                    <Button
                        variant="secondary"
                        className={styles.knapp}
                        type="button"
                        onClick={() => {
                            settKnappTrykket(Knapp.G_REGULERING);
                            setVisReguleringModal(true);
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
                {knappTrykket === Knapp.NØKKELTALL && <Nøkkeltall />}
            </div>
        </div>
    );
};

export default Drift;
