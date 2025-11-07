import { Alert, BodyShort } from '@navikt/ds-react';
import classNames from 'classnames';

import { ApiError, ErrorMessage } from '~src/api/apiClient';
import { MessageFormatter, useI18n } from '~src/lib/i18n';

import messages from './ApiErrorAlert-nb';
import { ApiErrorCode } from './apiErrorCode';
import styles from './apierroralert.module.less';

type ApiErrorAlertErrorType = Omit<ApiError, 'body'> & { body: ErrorMessage | ErrorMessage[] };

interface Props {
    error: ApiErrorAlertErrorType;
    className?: string;
    size?: 'medium' | 'small';
    variant?: 'error' | 'warning' | 'info' | 'success';
    children?: React.ReactNode;
}

export const useApiErrorMessages = () => {
    const { formatMessage } = useI18n({ messages });

    return (error: ApiErrorAlertErrorType) => konstruerMeldingForAlert(formatMessage, error);
};

const konstruerMeldingForAlert = (formatMessage: MessageFormatter<typeof messages>, error: ApiErrorAlertErrorType) => {
    try {
        if (error.statusCode === 503) {
            return formatMessage(ApiErrorCode.TJENESTEN_ER_IKKE_TILGJENGELIG);
        }

        if (Array.isArray(error.body)) {
            return error.body.map((err) => formatMessage(err.code));
        } else {
            return `${formatMessage(error.body.code)} \n melding: ${error.body.message}`;
        }
    } catch {
        return `Ukjent feil - Original feil: ${JSON.stringify(error)}`;
    }
};

const ApiErrorAlert = ({ error, className, size, variant = 'error', children }: Props) => {
    const { formatMessage } = useI18n({ messages });

    const melding = konstruerMeldingForAlert(formatMessage, error);

    return (
        <Alert variant={variant} className={classNames(className, styles.alertstripe)} size={size}>
            {!Array.isArray(melding) ? (
                <BodyShort>{melding}</BodyShort>
            ) : (
                melding.map((err, idx) => <BodyShort key={idx}>{err}</BodyShort>)
            )}
            {children}
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
