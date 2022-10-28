import { Alert } from '@navikt/ds-react';
import React from 'react';

import { ErrorMessage } from '~src/api/apiClient';
import messages from '~src/components/apiErrorAlert/ApiErrorAlert-nb';
import { ApiErrorCode } from '~src/components/apiErrorAlert/apiErrorCode';
import { useI18n } from '~src/lib/i18n';

import * as styles from './utfallSomIkkeStøttes.module.less';

/**
 * Bruker også for å håndtere varselmeldinger, da dem kommer i samme format.
 * TODO: Helhetlig kompontent navn som tar seg av feilmeldinger og varselmeldinger ved revurdering
 */
const UtfallSomIkkeStøttes = (props: { feilmeldinger: ErrorMessage[]; infoMelding?: boolean }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <Alert variant={props.infoMelding ? 'info' : 'error'} className={styles.alertstripe}>
            <ul>
                {props.feilmeldinger.map((m) => (
                    <li key={m.code}>{formatMessage(m.code ?? ApiErrorCode.UKJENT_FEIL)}</li>
                ))}
            </ul>
        </Alert>
    );
};

export default UtfallSomIkkeStøttes;
