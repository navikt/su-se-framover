import React from 'react';
import { useNavigate } from 'react-router-dom';

import AttesteringsForm from '~src/components/forms/attesteringForm/AttesteringsForm';
import OppsummeringAvTilbakekrevingsbehandling from '~src/components/oppsummering/oppsummeringAvTilbakekrevingsbehandling/OppsummeringAvTilbakekrevingsbehandling';
import { iverksettTilbakekreving, underkjennTilbakekreving } from '~src/features/TilbakekrevingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { UnderkjennelseGrunn } from '~src/types/Behandling';
import { ManuellTilbakekrevingsbehandling } from '~src/types/ManuellTilbakekrevingsbehandling';

import messages from '../Attestering-nb';

import styles from './AttesterTilbakekreving.module.less';

const AttesterTilbakekreving = (props: { behandling: ManuellTilbakekrevingsbehandling; saksversjon: number }) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });

    const redirectTilSaksoversikt = (message: string) => {
        Routes.navigateToSakIntroWithMessage(navigate, message, props.behandling.sakId);
    };

    const [iverksettStatus, attesteringIverksett] = useAsyncActionCreator(iverksettTilbakekreving);
    const [underkjennStatus, attesteringUnderkjent] = useAsyncActionCreator(underkjennTilbakekreving);

    const iverksettCallback = () =>
        attesteringIverksett(
            {
                sakId: props.behandling.sakId,
                behandlingId: props.behandling.id,
                versjon: props.saksversjon,
            },
            () => {
                redirectTilSaksoversikt('status.iverksatt');
            },
        );

    const underkjennCallback = (grunn: UnderkjennelseGrunn, kommentar: string) =>
        attesteringUnderkjent(
            {
                versjon: props.saksversjon,
                sakId: props.behandling.sakId,
                behandlingId: props.behandling.id,
                grunn: grunn,
                kommentar: kommentar,
            },
            () => {
                redirectTilSaksoversikt(formatMessage('status.sendtTilbake'));
            },
        );

    return (
        <div className={styles.mainContentContainer}>
            <AttesteringsForm
                sakId={props.behandling.sakId}
                iverksett={{ fn: iverksettCallback, status: iverksettStatus }}
                underkjenn={{ fn: underkjennCallback, status: underkjennStatus }}
            />
            <OppsummeringAvTilbakekrevingsbehandling behandling={props.behandling} />
        </div>
    );
};

export default AttesterTilbakekreving;