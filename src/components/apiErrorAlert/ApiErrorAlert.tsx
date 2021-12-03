import { Alert } from '@navikt/ds-react';
import React from 'react';

import { ApiError } from '~api/apiClient';
import { useI18n } from '~lib/i18n';

import messages from './ApiErrorAlert-nb';
import styles from './apierroralert.module.less';
import { ApiErrorCode } from './apiErrorCode';

const ApiErrorAlert = ({ error }: { error?: ApiError<ApiErrorCode | string> }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <Alert variant="error" className={styles.alertstripe}>
            {formatMessage(error?.body?.code ?? ApiErrorCode.UKJENT_FEIL)}
        </Alert>
    );
};

export default ApiErrorAlert;
