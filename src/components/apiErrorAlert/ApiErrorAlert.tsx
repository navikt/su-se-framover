import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import React from 'react';

import { ApiError } from '~api/apiClient';
import { useI18n } from '~lib/i18n';

import messages from './ApiErrorAlert-nb';
import styles from './apierroralert.module.less';
import { feilresponsTilFeilmelding } from './ApiErrorAlertUtils';
import revurderingsMessages from './revurderingFeilresponser/RevurderingApiError-nb';
import søknadsbehandlingMessages from './søknadsbehandlingFeilresponser/søknadsbehandlingApiError-nb';

const ApiErrorAlert = (props: { error?: ApiError }) => {
    const { formatMessage } = useI18n({
        messages: { ...messages, ...revurderingsMessages, ...søknadsbehandlingMessages },
    });

    const error = feilresponsTilFeilmelding(formatMessage, props.error?.body);

    return <AlertStripeFeil className={styles.alertstripe}>{error}</AlertStripeFeil>;
};

export default ApiErrorAlert;
