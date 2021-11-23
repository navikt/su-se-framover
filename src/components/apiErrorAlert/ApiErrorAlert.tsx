import { Alert } from '@navikt/ds-react';
import React from 'react';

import { ApiError } from '~api/apiClient';
import { RevurderingErrorCodes } from '~components/apiErrorAlert/revurderingApiError/RevurderingApiError';
import { FeilresponsErrorCodes, Generell } from '~components/apiErrorAlert/saksbehandlerApiError/ApiErrorTypes';
import { SøknadsbehandlingErrorCodes } from '~components/apiErrorAlert/søknadsbehandlingApiError/SøknadsbehandlingApiError';
import { useI18n } from '~lib/i18n';

import styles from './apierroralert.module.less';
import revurderingsMessages from './revurderingApiError/RevurderingApiError-nb';
import apiErrorMessages from './saksbehandlerApiError/ApiErrorAlert-nb';
import søknadsbehandlingMessages from './søknadsbehandlingApiError/søknadsbehandlingApiError-nb';

const ApiErrorAlert = ({
    error,
}: {
    error?: ApiError<FeilresponsErrorCodes | RevurderingErrorCodes | SøknadsbehandlingErrorCodes | string>;
}) => {
    const { formatMessage } = useI18n({
        messages: Object.assign(apiErrorMessages, revurderingsMessages, søknadsbehandlingMessages),
    });
    return (
        <Alert variant="error" className={styles.alertstripe}>
            {formatMessage(error?.body?.code ?? Generell.UKJENT_FEIL)}
        </Alert>
    );
};

export default ApiErrorAlert;
