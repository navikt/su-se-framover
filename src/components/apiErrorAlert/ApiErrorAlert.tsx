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
}

const ApiErrorAlert = ({ error, className = '' }: Props) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <Alert variant="error" className={classNames(className, styles.alertstripe)}>
            {formatMessage(error?.body?.code ?? ApiErrorCode.UKJENT_FEIL)}
        </Alert>
    );
};

export default ApiErrorAlert;
