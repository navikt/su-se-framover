import { Alert } from '@navikt/ds-react';
import React from 'react';

import { ErrorMessage } from '~api/apiClient';
import { Generell, RevurderingErrorCodes } from '~components/apiErrorAlert/revurderingApiError/RevurderingApiError';
import messages from '~components/apiErrorAlert/revurderingApiError/RevurderingApiError-nb';
import { useI18n } from '~lib/i18n';

import styles from './utfallSomIkkeStøttes.module.less';

const UtfallSomIkkeStøttes = (props: { feilmeldinger: Array<ErrorMessage<RevurderingErrorCodes | string>> }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <Alert variant="error" className={styles.alertstripe}>
            <ul>
                {props.feilmeldinger.map((m) => (
                    <li key={m.code}>{formatMessage(m.code ?? Generell.UKJENT_FEIL)}</li>
                ))}
            </ul>
        </Alert>
    );
};

export default UtfallSomIkkeStøttes;
