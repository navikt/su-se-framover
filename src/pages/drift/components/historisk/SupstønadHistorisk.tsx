import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Modal, TextField } from '@navikt/ds-react';
import { useState } from 'react';

import { tellRaderSupstønadHistorisk } from '~src/api/driftApi';
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
    const [tellRaderStatus, tellRader, resetTellRaderStatus] = useApiCall(tellRaderSupstønadHistorisk);

    const handleSubmit = () => {
        if (!tabellnavn.trim()) {
            return;
        }
        tellRader({ tabellnavn: tabellnavn.trim() });
    };

    const handleClose = () => {
        resetTellRaderStatus();
        setTabellnavn('');
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
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default SupstønadHistorisk;
