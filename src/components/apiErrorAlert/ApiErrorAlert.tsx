import { Alert } from '@navikt/ds-react';
import React from 'react';

import { ApiError } from '~api/apiClient';
import { useI18n } from '~lib/i18n';

import messages from './ApiErrorAlert-nb';
import styles from './apierroralert.module.less';
import { feilresponsTilFeilmelding } from './ApiErrorAlertUtils';
import revurderingsMessages from './revurderingApiError/RevurderingApiError-nb';
import søknadsbehandlingMessages from './søknadsbehandlingApiError/søknadsbehandlingApiError-nb';

const ApiErrorAlert = (props: { error?: ApiError }) => {
    const { formatMessage } = useI18n({
        messages: { ...messages, ...revurderingsMessages, ...søknadsbehandlingMessages },
    });

    const error = feilresponsTilFeilmelding(formatMessage, props.error?.body);

    return (
        <Alert variant="error" className={styles.alertstripe}>
            {error}
        </Alert>
    );
};

export default ApiErrorAlert;
