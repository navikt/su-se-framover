import { Alert, BodyShort } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

import { ApiError, ErrorMessage } from '~src/api/apiClient';
import { MessageFormatter, useI18n } from '~src/lib/i18n';

import messages from './ApiErrorAlert-nb';
import * as styles from './apierroralert.module.less';
import { ApiErrorCode } from './apiErrorCode';

type ApiErrorAlertErrorType = Omit<ApiError, 'body'> & { body: ErrorMessage | ErrorMessage[] | null };

interface Props {
    error?: ApiErrorAlertErrorType;
    className?: string;
    size?: 'medium' | 'small';
    variant?: 'error' | 'warning' | 'info' | 'success';
}

const mapErrorMessageToMessage = (formatMessage: MessageFormatter<typeof messages>, error: ErrorMessage) => {
    return error.code
        ? formatMessage(error.code)
        : formatMessage(ApiErrorCode.UKJENT_FEIL) + ` - Original feil: ${JSON.stringify(error)}`;
};

const mapErrorToMessage = (
    formatMessage: MessageFormatter<typeof messages>,
    error?: ApiErrorAlertErrorType
): string | string[] => {
    if (error?.statusCode === 503) {
        return formatMessage(ApiErrorCode.TJENESTEN_ER_IKKE_TILGJENGELIG);
    } else if (error?.body && Array.isArray(error.body)) {
        return error.body.map((err) => mapErrorMessageToMessage(formatMessage, err));
    } else if (!Array.isArray(error?.body) && error?.body?.code) {
        return mapErrorMessageToMessage(formatMessage, error.body);
    }
    return formatMessage(ApiErrorCode.UKJENT_FEIL) + ` - Original feil: ${JSON.stringify(error)}`;
};

const konstruerMeldingForAlert = (formatMessage: MessageFormatter<typeof messages>, error?: ApiErrorAlertErrorType) => {
    if (Array.isArray(error)) {
        return error.map((err) => mapErrorToMessage(formatMessage, err));
    } else {
        return mapErrorToMessage(formatMessage, error);
    }
};

const ApiErrorAlert = ({ error, className = '', size, variant = 'error' }: Props) => {
    const { formatMessage } = useI18n({ messages });

    const melding = konstruerMeldingForAlert(formatMessage, error);

    return (
        <Alert variant={variant} className={classNames(className, styles.alertstripe)} size={size}>
            {!Array.isArray(melding) ? (
                <BodyShort>{melding}</BodyShort>
            ) : (
                melding.map((err, idx) => <BodyShort key={idx}>{err}</BodyShort>)
            )}
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
