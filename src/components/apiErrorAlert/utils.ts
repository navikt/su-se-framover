import { ApiError, ErrorCode } from '~api/apiClient';
import { MessageFormatter } from '~lib/i18n';

import { statusFeilmeldinger } from './ApiErrorAlert-nb';

export const visErrorMelding = (
    error: ApiError,
    formatMessage: MessageFormatter<typeof statusFeilmeldinger>
): string => {
    switch (error.statusCode) {
        case ErrorCode.Unauthorized:
            return formatMessage('feilmelding.ikkeTilgang');
        case ErrorCode.NotFound:
            return formatMessage('feilmelding.fantIkkeSak');
        default:
            return formatMessage('feilmelding.generisk', {
                statusCode: error.statusCode,
            });
    }
};
