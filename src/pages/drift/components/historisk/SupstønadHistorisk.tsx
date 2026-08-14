import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Heading, Modal, TextField } from '@navikt/ds-react';
import { useState } from 'react';

import { hentUttrekkSupstønadHistorisk, tellRaderSupstønadHistorisk } from '~src/api/driftApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { useApiCall } from '~src/lib/hooks';

import styles from './SupstønadHistorisk.module.less';

const SupstønadHistorisk = () => {
    const [visSupstønadHistoriskModal, setVisSupstønadHistoriskModal] = useState(false);

    return (
        <div>
            <Button variant="secondary" type="button" onClick={() => setVisSupstønadHistoriskModal(true)}>
                Stønadshistorisk
            </Button>
            {visSupstønadHistoriskModal && (
                <SupstønadHistoriskModal
                    visModal={visSupstønadHistoriskModal}
                    onClose={() => setVisSupstønadHistoriskModal(false)}
                />
            )}
        </div>
    );
};

const SupstønadHistoriskModal = (props: { visModal: boolean; onClose: () => void }) => {
    const [tabellnavn, setTabellnavn] = useState('');
    const [antallRader, setAntallRader] = useState('');
    const [iterator, setIterator] = useState('');
    const [tellRaderStatus, tellRader, resetTellRaderStatus] = useApiCall(tellRaderSupstønadHistorisk);
    const [hentUttrekkStatus, hentUttrekk, resetHentUttrekkStatus] = useApiCall(hentUttrekkSupstønadHistorisk);

    const handleSubmit = () => {
        if (!tabellnavn.trim()) {
            return;
        }
        tellRader({ tabellnavn: tabellnavn.trim() });
    };

    const handleHentUttrekkSubmit = () => {
        const antall = Number(antallRader);
        if (!tabellnavn.trim() || !antallRader.trim() || antall <= 0) {
            return;
        }
        hentUttrekk({
            tabellnavn: tabellnavn.trim(),
            antallRader: antall,
            iterator: iterator.trim() || undefined,
        });
    };

    const handleClose = () => {
        resetTellRaderStatus();
        resetHentUttrekkStatus();
        setTabellnavn('');
        setAntallRader('');
        setIterator('');
        props.onClose();
    };

    return (
        <Modal open={props.visModal} onClose={handleClose} header={{ heading: 'Stønadshistorisk' }}>
            <Modal.Body>
                <div className={styles.modal}>
                    <TextField
                        label={'Tabellnavn'}
                        value={tabellnavn}
                        onChange={(e) => setTabellnavn(e.target.value)}
                    />
                    <Button
                        onClick={handleSubmit}
                        loading={RemoteData.isPending(tellRaderStatus)}
                        disabled={!tabellnavn.trim()}
                    >
                        Tell rader
                    </Button>
                    {RemoteData.isSuccess(tellRaderStatus) && (
                        <Alert variant="success">Antall rader: {tellRaderStatus.value.antallRader}</Alert>
                    )}
                    {RemoteData.isFailure(tellRaderStatus) && <ApiErrorAlert error={tellRaderStatus.error} />}

                    <hr className={styles.divider} />

                    <Heading level="2" size="small">
                        Hent uttrekk
                    </Heading>
                    <TextField
                        label={'Antall rader'}
                        type="number"
                        min={1}
                        inputMode="numeric"
                        value={antallRader}
                        onChange={(e) => setAntallRader(e.target.value)}
                    />
                    <TextField
                        label={'Iterator (valgfri)'}
                        value={iterator}
                        onChange={(e) => setIterator(e.target.value)}
                    />
                    <Button
                        onClick={handleHentUttrekkSubmit}
                        loading={RemoteData.isPending(hentUttrekkStatus)}
                        disabled={!tabellnavn.trim() || !antallRader.trim() || Number(antallRader) <= 0}
                    >
                        Hent uttrekk
                    </Button>
                    {RemoteData.isSuccess(hentUttrekkStatus) && (
                        <Alert variant="info">
                            <pre className={styles.uttrekkResultat}>
                                {JSON.stringify(hentUttrekkStatus.value, null, 2)}
                            </pre>
                        </Alert>
                    )}
                    {RemoteData.isFailure(hentUttrekkStatus) && <ApiErrorAlert error={hentUttrekkStatus.error} />}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default SupstønadHistorisk;
