import { Alert } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

import { ApiError } from '~api/apiClient';
import { useI18n } from '~lib/i18n';

import messages from './ApiErrorAlert-nb';
import styles from './apierroralert.module.less';
import { ApiErrorCode } from './apiErrorCode';

interface Props {
    error?: ApiError;
    className?: string;
    size?: 'medium' | 'small';
}

const ApiErrorAlert = ({ error, className = '', size }: Props) => {
    const { formatMessage } = useI18n({ messages });

    const melding =
        error?.statusCode === 503
            ? formatMessage(ApiErrorCode.TJENESTEN_ER_IKKE_TILGJENGELIG)
            : formatMessage(error?.body?.code ?? ApiErrorCode.UKJENT_FEIL);

    return (
        <Alert variant="error" className={classNames(className, styles.alertstripe)} size={size}>
            {melding}
        </Alert>
    );
};

export default ApiErrorAlert;
