import * as RemoteData from '@devexperts/remote-data-ts';
import { ArrowsCirclepathIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, Modal } from '@navikt/ds-react';
import React, { useRef } from 'react';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import OppsummeringAvKravgrunnlag from '~src/components/oppsummering/kravgrunnlag/OppsummeringAvKravgrunnlag';
import { oppdaterKravgrunnlag } from '~src/features/TilbakekrevingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { ManuellTilbakekrevingsbehandling } from '~src/types/ManuellTilbakekrevingsbehandling';

import messages from '../Tilbakekreving-nb';

import styles from './VisKRavgrunnlagMedRefresh.module.less';

const VisKravgrunnlagMedRefresh = (props: {
    tilbakekreving: ManuellTilbakekrevingsbehandling;
    basicOppsummeringAvHeleKravgrunnlaget?: boolean;
}) => {
    return (
        <div>
            <OppsummeringAvKravgrunnlag
                kravgrunnlag={props.tilbakekreving.kravgrunnlag}
                basicOppsummeringAvHeleKravgrunnlaget={
                    props.basicOppsummeringAvHeleKravgrunnlaget
                        ? {
                              medTittel: true,
                              headerContent: <RefreshKravgrunnlagModal tilbakekreving={props.tilbakekreving} />,
                          }
                        : undefined
                }
                bareOppsummerMetaInfo={
                    props.basicOppsummeringAvHeleKravgrunnlaget
                        ? undefined
                        : {
                              medTittel: true,
                              headerContent: <RefreshKravgrunnlagModal tilbakekreving={props.tilbakekreving} />,
                          }
                }
            />
        </div>
    );
};

const RefreshKravgrunnlagModal = (props: { tilbakekreving: ManuellTilbakekrevingsbehandling }) => {
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

export default VisKravgrunnlagMedRefresh;
