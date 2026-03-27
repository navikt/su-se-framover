import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Checkbox, Modal } from '@navikt/ds-react';
import { useState } from 'react';

import { kjørFradragssjekk } from '~src/api/driftApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { MonthPicker } from '~src/components/inputs/datePicker/DatePicker';
import { useApiCall } from '~src/lib/hooks';
import { Nullable } from '~src/lib/types';
import { toIsoMonth } from '~src/utils/date/dateUtils';

import styles from './Fradragssjekk.module.less';

const Fradragssjekk = () => {
    const [visFradragssjekkModal, setVisFradragssjekkModal] = useState(false);

    return (
        <div>
            <Button variant="secondary" type="button" onClick={() => setVisFradragssjekkModal(true)}>
                Fradragssjekk
            </Button>
            {visFradragssjekkModal && (
                <FradragssjekkModal visModal={visFradragssjekkModal} onClose={() => setVisFradragssjekkModal(false)} />
            )}
        </div>
    );
};

const FradragssjekkModal = (props: { visModal: boolean; onClose: () => void }) => {
    const [maaned, setMaaned] = useState<Nullable<Date>>(null);
    const [dryRun, setDryRun] = useState(false);
    const [fradragssjekkStatus, startFradragssjekk, resetFradragssjekkStatus] = useApiCall(kjørFradragssjekk);

    const handleSubmit = () => {
        if (!maaned) {
            return;
        }

        startFradragssjekk({
            maaned: toIsoMonth(maaned),
            dryRun,
        });
    };

    const handleClose = () => {
        resetFradragssjekkStatus();
        setMaaned(null);
        setDryRun(false);
        props.onClose();
    };

    const renderStatus = () => {
        if (RemoteData.isSuccess(fradragssjekkStatus)) {
            return <Alert variant="success">Kjøring startet.</Alert>;
        }

        if (RemoteData.isFailure(fradragssjekkStatus)) {
            if (fradragssjekkStatus.error.statusCode === 409) {
                return <Alert variant="warning">Ordinær kjøring finnes allerede for denne måneden.</Alert>;
            }

            if (fradragssjekkStatus.error.statusCode === 400) {
                return <Alert variant="error">Ugyldig måned.</Alert>;
            }

            return <ApiErrorAlert error={fradragssjekkStatus.error} />;
        }

        return null;
    };

    return (
        <Modal
            className={styles.modal}
            open={props.visModal}
            onClose={handleClose}
            header={{ heading: 'Fradragssjekk' }}
        >
            <Modal.Body>
                <div className={styles.form}>
                    <MonthPicker label="Måned" value={maaned} onChange={setMaaned} />
                    <Checkbox checked={dryRun} onChange={() => setDryRun(!dryRun)}>
                        Dry run
                    </Checkbox>
                    {renderStatus()}
                    <div className={styles.actions}>
                        <Button
                            onClick={handleSubmit}
                            loading={RemoteData.isPending(fradragssjekkStatus)}
                            disabled={!maaned}
                        >
                            Start kjøring
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default Fradragssjekk;
