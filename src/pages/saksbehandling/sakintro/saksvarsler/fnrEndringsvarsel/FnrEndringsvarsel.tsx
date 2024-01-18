import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Modal } from '@navikt/ds-react';
import { useState } from 'react';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar';
import { bekreftFnrEndring } from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import messages from '~src/pages/saksbehandling/saksoversikt-nb';
import { Person } from '~src/types/Person';
import { Sak } from '~src/types/Sak';

import * as styles from './FnrEndringsvarsel.module.less';

const FnrEndringsvarsel = (props: { sak: Sak; søker: Person }) => {
    const { formatMessage } = useI18n({ messages });
    const [seMerInfo, setSeMerInfo] = useState(false);
    return (
        <div>
            {formatMessage('fnrEndring.registrertAnnetFnr')}
            <Button variant="tertiary" className={styles.merInfoButton} onClick={() => setSeMerInfo(true)}>
                {formatMessage('fnrEndring.klikkForInfo')}
            </Button>

            <BekreftFnrEndringModal
                open={seMerInfo}
                onClose={() => setSeMerInfo(false)}
                sakId={props.sak.id}
                nyttFnr={props.søker.fnr}
                forrigeFnr={props.sak.fnr}
            />
        </div>
    );
};

const BekreftFnrEndringModal = (props: {
    open: boolean;
    onClose: () => void;
    sakId: string;
    nyttFnr: string;
    forrigeFnr: string;
}) => {
    const { formatMessage } = useI18n({ messages });
    const [bekreftStatus, bekreft] = useAsyncActionCreator(bekreftFnrEndring);

    return (
        <Modal
            className={styles.fnrEndringsModal}
            open={props.open}
            onClose={props.onClose}
            header={{ heading: 'Bekreft fødselsnummerendring' }}
        >
            <Modal.Body>
                <OppsummeringPar label={'Nytt fødselsnummer'} verdi={props.nyttFnr} />
                <OppsummeringPar label={'Forrige fødselsnummer'} verdi={props.forrigeFnr} />
            </Modal.Body>
            <Modal.Footer className={styles.modalFooter}>
                <div className={styles.modalFooterButtonsContainer}>
                    <Button variant="secondary" onClick={props.onClose}>
                        {formatMessage('fnrEndring.bekreftSenere')}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() =>
                            bekreft({ sakId: props.sakId, nyttFnr: props.nyttFnr, forrigeFnr: props.forrigeFnr })
                        }
                        loading={RemoteData.isPending(bekreftStatus)}
                    >
                        {formatMessage('fnrEndring.bekreft')}
                    </Button>
                </div>

                {RemoteData.isFailure(bekreftStatus) && <ApiErrorAlert error={bekreftStatus.error} />}
                {RemoteData.isSuccess(bekreftStatus) && (
                    <Alert variant="success">{formatMessage('fnrEndring.fnrBekreftet')}</Alert>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default FnrEndringsvarsel;
