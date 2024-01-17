import * as RemoteData from '@devexperts/remote-data-ts';
import { ArrowsCirclepathIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, Modal } from '@navikt/ds-react';
import { useRef } from 'react';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { oppdaterKravgrunnlag } from '~src/features/TilbakekrevingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { ManuellTilbakekrevingsbehandling } from '~src/types/ManuellTilbakekrevingsbehandling';

import messages from '../Tilbakekreving-nb';

import styles from './VisKRavgrunnlagMedRefresh.module.less';

export const RefreshKravgrunnlagModal = (props: { tilbakekreving: ManuellTilbakekrevingsbehandling }) => {
    const { formatMessage } = useI18n({ messages });
    const ref = useRef<HTMLDialogElement>(null);
    const [oppdaterStatus, oppdater] = useAsyncActionCreator(oppdaterKravgrunnlag);

    return (
        <>
            <Button className={styles.refreshButton} variant="tertiary" onClick={() => ref.current?.showModal()}>
                <ArrowsCirclepathIcon className={styles.arrowIcon} title="Last inn nytt kravgrunnlag" fontSize="2rem" />
            </Button>

            <Modal ref={ref} header={{ heading: formatMessage('visKravgrunnlagMedRefresh.modal.tittel') }}>
                <Modal.Body className={styles.modalBody}>
                    <div>
                        <BodyShort>{formatMessage('visKravgrunnlagMedRefresh.modal.body.text.p1')}</BodyShort>
                        <BodyShort>{formatMessage('visKravgrunnlagMedRefresh.modal.body.text.p2')}</BodyShort>
                    </div>

                    <div className={styles.modalBodyButtonContainer}>
                        <Button variant="secondary" onClick={() => ref.current?.close()}>
                            {formatMessage('visKravgrunnlagMedRefresh.modal.body.button.avbryt')}
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() =>
                                oppdater({
                                    sakId: props.tilbakekreving.sakId,
                                    behandlingId: props.tilbakekreving.id,
                                    versjon: props.tilbakekreving.versjon,
                                })
                            }
                        >
                            {formatMessage('visKravgrunnlagMedRefresh.modal.body.button.hent')}
                        </Button>
                    </div>
                    {RemoteData.isFailure(oppdaterStatus) && <ApiErrorAlert error={oppdaterStatus.error} />}
                </Modal.Body>
            </Modal>
        </>
    );
};
