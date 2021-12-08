import { Alert } from '@navikt/ds-react';
import React from 'react';

import { ErrorMessage } from '~api/apiClient';
import messages from '~components/apiErrorAlert/ApiErrorAlert-nb';
import { ApiErrorCode } from '~components/apiErrorAlert/apiErrorCode';
import { useI18n } from '~lib/i18n';

import styles from './utfallSomIkkeStøttes.module.less';

const UtfallSomIkkeStøttes = (props: { feilmeldinger: ErrorMessage[] }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <Alert variant="error" className={styles.alertstripe}>
            <ul>
                {props.feilmeldinger.map((m) => (
                    <li key={m.code}>{formatMessage(m.code ?? ApiErrorCode.UKJENT_FEIL)}</li>
                ))}
            </ul>
        </Alert>
    );
};

export default UtfallSomIkkeStøttes;
