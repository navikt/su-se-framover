import { Alert, BodyShort } from '@navikt/ds-react';
import classNames from 'classnames';

import { ApiError, ErrorMessage } from '~src/api/apiClient';
import { MessageFormatter, useI18n } from '~src/lib/i18n';

import messages, { statusFeilmeldinger } from './ApiErrorAlert-nb';
import { ApiErrorCode } from './apiErrorCode';
import styles from './apierroralert.module.less';

const apiErrorMessages = { ...messages, ...statusFeilmeldinger };

type ApiErrorAlertErrorType = Omit<ApiError, 'body'> & { body: ErrorMessage | ErrorMessage[] };

interface Props {
    error: ApiErrorAlertErrorType;
    className?: string;
    size?: 'medium' | 'small';
    variant?: 'error' | 'warning' | 'info' | 'success';
    children?: React.ReactNode;
}

export const useApiErrorMessages = () => {
    const { formatMessage } = useI18n({ messages: apiErrorMessages });

    return (error: ApiErrorAlertErrorType) => konstruerMeldingForAlert(formatMessage, error);
};

const konstruerMeldingForAlert = (
    formatMessage: MessageFormatter<typeof apiErrorMessages>,
    error: ApiErrorAlertErrorType,
) => {
    try {
        if (error.statusCode === 503) {
            return formatMessage(ApiErrorCode.TJENESTEN_ER_IKKE_TILGJENGELIG);
        }

        if (Array.isArray(error.body)) {
            return error.body.map((err) => formatErrorCode(formatMessage, err.code, err.message));
        } else {
            if (error.body.code === ApiErrorCode.KUNNE_IKKE_SLÅ_OPP_EPS) {
                if (error.statusCode === 403) {
                    return error.body.message || formatMessage('feilmelding.eps.ikkeTilgang');
                }
                if (error.statusCode === 404) {
                    return error.body.message || formatMessage('feilmelding.eps.ikkeFunnet');
                }
                if (error.statusCode >= 500) {
                    return formatMessage('feilmelding.eps.teknisk');
                }
            }

            const errors = Array.isArray(error.body.errors) ? error.body.errors : [];
            if (errors.length > 0) {
                return errors.map(({ felt, begrunnelse }) => `${felt}: ${begrunnelse}`);
            }
            const codeMessage = formatErrorCode(formatMessage, error.body.code, error.body.message);
            return codeMessage === error.body.message
                ? codeMessage
                : `${codeMessage} \n melding: ${error.body.message}`;
        }
    } catch {
        return `Ukjent feil - Original feil: ${JSON.stringify(error)}`;
    }
};

const formatErrorCode = (
    formatMessage: MessageFormatter<typeof apiErrorMessages>,
    code: ApiErrorCode,
    backendMessage: unknown,
): string => {
    const knownCode = Object.values(ApiErrorCode).find((value) => value === code);
    if (knownCode) {
        return formatMessage(knownCode);
    }

    return typeof backendMessage === 'string' && backendMessage.trim()
        ? backendMessage
        : formatMessage(ApiErrorCode.UKJENT_FEIL);
};

const ApiErrorAlert = ({ error, className, size, variant = 'error', children }: Props) => {
    const { formatMessage } = useI18n({ messages: apiErrorMessages });

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
