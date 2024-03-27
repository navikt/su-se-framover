import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Modal, Tabs } from '@navikt/ds-react';
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
    const [dryRunStatus, dryRun] = useApiCall(driftApi.dryRunPersonhendelser);
    const [personhendelserCSV, setPersonhendelserCSV] = useState<Nullable<File>>(null);
    const [personhendelserCSVDry, setPersonhendelserCSVDry] = useState<Nullable<File>>(null);

    const handleSubmit = () => {
        if (!personhendelserCSV) {
            console.log('No file selected');
            return;
        }
        sendPersonHendelser({ hendelser: personhendelserCSV });
    };
    const handleDryRun = () => {
        if (!personhendelserCSVDry) {
            console.log('No file selected');
            return;
        }
        dryRun({ hendelser: personhendelserCSVDry });
    };

    return (
        <Modal
            className={styles.modal}
            open={props.visModal}
            onClose={props.onClose}
            header={{ heading: 'Personhendelser' }}
        >
            <Modal.Body className={styles.modalBody}>
                <Tabs defaultValue="dry-run">
                    <Tabs.List>
                        <Tabs.Tab value="dry-run" label="Dry-run" />
                        <Tabs.Tab value="personhendelser" label="Innsending av personhendelser" />
                    </Tabs.List>
                    <Tabs.Panel value="dry-run" className={styles.tabPanel}>
                        <div className={styles.panelInnholdContainer}>
                            <input
                                type="file"
                                onChange={(e) => (e.target.files ? setPersonhendelserCSVDry(e.target.files[0]) : null)}
                            />

                            {RemoteData.isFailure(dryRunStatus) && <ApiErrorAlert error={dryRunStatus.error} />}
                            {RemoteData.isSuccess(dryRunStatus) && (
                                <Alert variant="success">Dry run av personhendelser OK 👍🤌</Alert>
                            )}
                            <Button onClick={handleDryRun} loading={RemoteData.isPending(dryRunStatus)}>
                                Dry run personhendelser
                            </Button>
                        </div>
                    </Tabs.Panel>
                    <Tabs.Panel value="personhendelser" className={styles.tabPanel}>
                        <div className={styles.panelInnholdContainer}>
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
                            <Button onClick={handleSubmit} loading={RemoteData.isPending(sendPersonhendelserStatus)}>
                                Oppdater personhendelser
                            </Button>
                        </div>
                    </Tabs.Panel>
                </Tabs>
            </Modal.Body>
        </Modal>
    );
};

export default Personhendelser;
