import { Alert } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

import { ApiError, ErrorMessage } from '~src/api/apiClient';
import { useI18n } from '~src/lib/i18n';

import messages from './ApiErrorAlert-nb';
import * as styles from './apierroralert.module.less';
import { ApiErrorCode } from './apiErrorCode';

interface Props {
    error?: ApiError;
    className?: string;
    size?: 'medium' | 'small';
    variant?: 'error' | 'warning' | 'info' | 'success';
}

const ApiErrorAlert = ({ error, className = '', size, variant = 'error' }: Props) => {
    const { formatMessage } = useI18n({ messages });

    const melding =
        error?.statusCode === 503
            ? formatMessage(ApiErrorCode.TJENESTEN_ER_IKKE_TILGJENGELIG)
            : formatMessage(error?.body?.code ?? ApiErrorCode.UKJENT_FEIL);

    return (
        <Alert variant={variant} className={classNames(className, styles.alertstripe)} size={size}>
            {melding}
        </Alert>
    );
};

export const ErrorMessageAlert = (props: Omit<Props, 'error'> & { err: ErrorMessage }) => {
    return (
        <ApiErrorAlert
            error={{
                statusCode: 418,
                correlationId: 'jeg er en hardkodet correlation id for å late som om jeg er en apiError',
                body: props.err,
            }}
            {...props}
            variant={props.err.code === ApiErrorCode.INGEN_SKATTEGRUNNLAG_FOR_GITT_FNR_OG_ÅR ? 'info' : undefined}
        />
    );
};

export default ApiErrorAlert;
