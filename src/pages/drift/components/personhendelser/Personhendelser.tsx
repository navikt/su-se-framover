import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Modal } from '@navikt/ds-react';
import { useState } from 'react';

import * as driftApi from '~src/api/driftApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { useApiCall } from '~src/lib/hooks';
import { Nullable } from '~src/lib/types';

import styles from './Personhendelser.module.less';

const Personhendelser = () => {
    const [visPersonhendelserModal, setPersonhendelserModal] = useState(false);

    return (
        <div>
            <PersonhendelserModal visModal={visPersonhendelserModal} onClose={() => setPersonhendelserModal(false)} />
            <Button
                variant="secondary"
                type="button"
                onClick={() => {
                    setPersonhendelserModal(true);
                }}
            >
                Last opp personhendelser
            </Button>
        </div>
    );
};

const PersonhendelserModal = (props: { visModal: boolean; onClose: () => void }) => {
    const [sendPersonhendelserStatus, sendPersonHendelser] = useApiCall(driftApi.sendPersonhendelser);
    const [personhendelserCSV, setPersonhendelserCSV] = useState<Nullable<File>>(null);

    const handleSubmit = () => {
        if (!personhendelserCSV) {
            console.log('No file selected');
            return;
        }
        sendPersonHendelser({ hendelser: personhendelserCSV });
    };

    return (
        <Modal
            className={styles.modal}
            open={props.visModal}
            onClose={props.onClose}
            header={{ heading: 'Personhendelser' }}
        >
            <Modal.Body className={styles.modalBody}>
                <input
                    type="file"
                    onChange={(e) => (e.target.files ? setPersonhendelserCSV(e.target.files[0]) : null)}
                />

                {RemoteData.isFailure(sendPersonhendelserStatus) && (
                    <ApiErrorAlert error={sendPersonhendelserStatus.error} />
                )}
                {RemoteData.isSuccess(sendPersonhendelserStatus) && (
                    <Alert variant="success">Oppdatering av personhendelser OK 👍🤌</Alert>
                )}
                <Button onClick={handleSubmit}>Oppdater personhendelser</Button>
            </Modal.Body>
        </Modal>
    );
};

export default Personhendelser;
