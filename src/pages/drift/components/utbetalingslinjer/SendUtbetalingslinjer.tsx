import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, HGrid, Heading, Label, Modal, Textarea } from '@navikt/ds-react';
import React, { useState } from 'react';

import { sendNyeUtbetalingslinjer } from '~src/api/driftApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { useApiCall } from '~src/lib/hooks';
import { NyeUtbetalingslinjerResponse } from '~src/types/Utbetaling';

import styles from '../../index.module.less';

const SendUtbetalingslinjer = () => {
    const [vilSendeUtbetalingslinjer, setVilSendeUtbetalingslinjer] = useState<boolean>(false);
    return (
        <div>
            <Button
                variant="secondary"
                className={styles.knapp}
                type="button"
                onClick={() => setVilSendeUtbetalingslinjer(true)}
            >
                Send nye utbetalingslinjer
            </Button>
            {vilSendeUtbetalingslinjer && (
                <VilSendeUtbetalingslinjerModal
                    open={vilSendeUtbetalingslinjer}
                    onClose={() => setVilSendeUtbetalingslinjer(false)}
                />
            )}
        </div>
    );
};

const VilSendeUtbetalingslinjerModal = (props: { open: boolean; onClose: () => void }) => {
    const [sendNyeLinjerStatus, sendNyeLinjer] = useApiCall(sendNyeUtbetalingslinjer);
    const [utbetalingslinjer, setUtbetalingslinjer] = useState<string>('');

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            header={{
                heading: 'Send nye utbetalingslinjer',
                size: 'medium',
            }}
        >
            <Modal.Body className={styles.modalContainer}>
                <Textarea
                    label={'Utbetalingslinjer - CSV'}
                    minRows={10}
                    onChange={(v) => setUtbetalingslinjer(v.target.value)}
                />
                <Button onClick={() => sendNyeLinjer({ utbetalingslinjer })}>Send nye linjer</Button>

                {RemoteData.isSuccess(sendNyeLinjerStatus) && <NyeLinjerSuccess linjer={sendNyeLinjerStatus.value} />}
                {RemoteData.isFailure(sendNyeLinjerStatus) && <ApiErrorAlert error={sendNyeLinjerStatus.error} />}
            </Modal.Body>
        </Modal>
    );
};

const NyeLinjerSuccess = (props: { linjer: NyeUtbetalingslinjerResponse }) => {
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
                            <li key={it.utbetalingId}>{it.utbetalingId}</li>
                        ))}
                    </ul>
                </div>
            </HGrid>
        </div>
    );
};

export default SendUtbetalingslinjer;
