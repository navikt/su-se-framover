import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import React from 'react';

import { ErrorMessage } from '~api/apiClient';
import { utfallSomIkkeStøttesKodeTilFeilmelding } from '~components/apiErrorAlert/revurderingApiError/RevurderingApiError';
import revurderingErrorMessages from '~components/apiErrorAlert/revurderingApiError/RevurderingApiError-nb';
import { useI18n } from '~lib/i18n';

import styles from './utfallSomIkkeStøttes.module.less';

const UtfallSomIkkeStøttes = (props: { feilmeldinger: ErrorMessage[] }) => {
    const { formatMessage } = useI18n({ messages: revurderingErrorMessages });
    const messages = utfallSomIkkeStøttesKodeTilFeilmelding(formatMessage, props.feilmeldinger);
    return (
        <AlertStripeFeil className={styles.alertstripe}>
            <ul>
                {messages.map((m) => (
                    <li key={m}>{m}</li>
                ))}
            </ul>
        </AlertStripeFeil>
    );
};

export default UtfallSomIkkeStøttes;
