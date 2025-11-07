import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyShort, Button, Heading, HGrid, Label, Modal, Textarea } from '@navikt/ds-react';
import { useState } from 'react';

import { sendUtbetalingsIder } from '~src/api/driftApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { useApiCall } from '~src/lib/hooks';
import { NyeUtbetalingslinjerResponse } from '~src/types/Utbetaling';

import styles from '../../index.module.less';

const SendUtbetalingsIder = () => {
    const [vilSendeUtbetalingsIder, setVilSendeUtbetalingsIder] = useState<boolean>(false);
    return (
        <div>
            <Button
                variant="secondary"
                className={styles.knapp}
                type="button"
                onClick={() => setVilSendeUtbetalingsIder(true)}
            >
                Send utbetalingsIder på nytt
            </Button>
            {vilSendeUtbetalingsIder && (
                <VilSendeUtbetalingsIderModal
                    open={vilSendeUtbetalingsIder}
                    onClose={() => setVilSendeUtbetalingsIder(false)}
                />
            )}
        </div>
    );
};

const VilSendeUtbetalingsIderModal = (props: { open: boolean; onClose: () => void }) => {
    const [sendIderStatus, sendIder] = useApiCall(sendUtbetalingsIder);
    const [utbetalingsIder, setUtbetalingsIder] = useState<string>('');

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            header={{
                heading: 'Send utbetalingsIder på nytt',
                size: 'medium',
            }}
        >
            <Modal.Body className={styles.modalContainer}>
                <Textarea
                    label={'Utbetalingslinjer - CSV'}
                    minRows={10}
                    onChange={(v) => setUtbetalingsIder(v.target.value)}
                />
                <Button onClick={() => sendIder({ utbetalingslinjer: utbetalingsIder })}>Send utbetalingsIder</Button>

                {RemoteData.isSuccess(sendIderStatus) && <UtbetalingsIderResponse linjer={sendIderStatus.value} />}
                {RemoteData.isFailure(sendIderStatus) && <ApiErrorAlert error={sendIderStatus.error} />}
            </Modal.Body>
        </Modal>
    );
};

const UtbetalingsIderResponse = (props: { linjer: NyeUtbetalingslinjerResponse }) => {
    return (
        <div>
            <Heading size="small">Resultat</Heading>
            <HGrid columns={2} gap="2">
                <div>
                    <Label>Success</Label>
                    <ul>
                        {props.linjer.success.map((it) => (
                            <li key={it.utbetalingId}>{it.utbetalingId}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <Label>Failed</Label>
                    <ul>
                        {props.linjer.failed.map((it) => (
                            <li key={it.utbetalingId}>
                                <BodyShort>{it.utbetalingId}</BodyShort>
                                <BodyShort style={{ marginLeft: '1rem' }}>{it.feilmelding}</BodyShort>
                            </li>
                        ))}
                    </ul>
                </div>
            </HGrid>
        </div>
    );
};

export default SendUtbetalingsIder;
