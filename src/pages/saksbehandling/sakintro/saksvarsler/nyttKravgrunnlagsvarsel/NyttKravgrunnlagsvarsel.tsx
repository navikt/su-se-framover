import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Label, Modal } from '@navikt/ds-react';
import React, { useState } from 'react';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import OppsummeringAvKravgrunnlag from '~src/components/oppsummering/kravgrunnlag/OppsummeringAvKravgrunnlag';
import { Oppsummeringsfarge } from '~src/components/oppsummeringspanel/Oppsummeringspanel';
import * as TilbakekrevingActions from '~src/features/TilbakekrevingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import messages from '~src/pages/saksbehandling/saksoversikt-nb';
import { Kravgrunnlag } from '~src/types/Kravgrunnlag';
import { ManuellTilbakekrevingsbehandling } from '~src/types/ManuellTilbakekrevingsbehandling';

import styles from './NyttKravgrunnlagsvarsel.module.less';

const NyttKravgrunnlagsvarsel = (props: {
    saksversjon: number;
    uteståendeKravgrunnlag: Kravgrunnlag;
    behandling: ManuellTilbakekrevingsbehandling;
}) => {
    const { formatMessage } = useI18n({ messages });
    const [seMerInfo, setSeMerInfo] = useState(false);
    return (
        <div>
            {formatMessage('saksvarsel.nyttKravgrunnlag.alert.text')}
            <Button variant="tertiary" className={styles.merInfoButton} onClick={() => setSeMerInfo(true)}>
                {formatMessage('saksvarsel.nyttKravgrunnlag.alert.knapp.merInfo')}
            </Button>

            <OppdaterKravgrunnlagModal
                open={seMerInfo}
                onClose={() => setSeMerInfo(false)}
                saksversjon={props.saksversjon}
                uteståendeKravgrunnlag={props.uteståendeKravgrunnlag}
                behandling={props.behandling}
            />
        </div>
    );
};

const OppdaterKravgrunnlagModal = (props: {
    open: boolean;
    onClose: () => void;
    saksversjon: number;
    uteståendeKravgrunnlag: Kravgrunnlag;
    behandling: ManuellTilbakekrevingsbehandling;
}) => {
    const { formatMessage } = useI18n({ messages });
    const [oppdaterStatus, oppdaterKravgrunnlag] = useAsyncActionCreator(TilbakekrevingActions.oppdaterKravgrunnlag);

    return (
        <Modal
            className={styles.modalContainer}
            open={props.open}
            onClose={props.onClose}
            header={{ heading: formatMessage('saksvarsel.nyttKravgrunnlag.modal.heading.tittel') }}
        >
            <Modal.Body>
                <Label>{formatMessage('saksvarsel.nyttKravgrunnlag.modal.body.text.p1')}</Label>

                <div className={styles.kravgrunnlagOppsummeringscontainer}>
                    <OppsummeringAvKravgrunnlag
                        kravgrunnlag={props.behandling.kravgrunnlag}
                        oppsummeringMedPanel={{
                            tittel: formatMessage(
                                'saksvarsel.nyttKravgrunnlag.modal.body.oppsummeringAvBehandlingskravgrunnlag.tittel',
                            ),
                        }}
                        kompakt
                    />
                    <OppsummeringAvKravgrunnlag
                        kravgrunnlag={props.uteståendeKravgrunnlag}
                        oppsummeringMedPanel={{
                            tittel: formatMessage(
                                'saksvarsel.nyttKravgrunnlag.modal.body.oppsummeringAvUteståendeKravgrunnlagPåSak.tittel',
                            ),
                            farge: Oppsummeringsfarge.Limegrønn,
                        }}
                        kompakt
                    />
                </div>
            </Modal.Body>
            <Modal.Footer className={styles.modalFooter}>
                <div className={styles.modalFooterButtonsContainer}>
                    <Button variant="secondary" onClick={props.onClose}>
                        {formatMessage('saksvarsel.nyttKravgrunnlag.modal.footer.knapp.oppdaterSenere')}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() =>
                            oppdaterKravgrunnlag({
                                sakId: props.behandling.sakId,
                                behandlingId: props.behandling.id,
                                versjon: props.saksversjon,
                            })
                        }
                        loading={RemoteData.isPending(oppdaterStatus)}
                    >
                        {formatMessage('saksvarsel.nyttKravgrunnlag.modal.footer.knapp.oppdater')}
                    </Button>
                </div>

                {RemoteData.isFailure(oppdaterStatus) && <ApiErrorAlert error={oppdaterStatus.error} />}
                {RemoteData.isSuccess(oppdaterStatus) && (
                    <Alert variant="success">{formatMessage('saksvarsel.nyttKravgrunnlag.modal.footer.success')}</Alert>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default NyttKravgrunnlagsvarsel;
