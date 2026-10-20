import messages from '~src/components/apiErrorAlert/ApiErrorAlert-nb';
import { ApiErrorCode } from '~src/components/apiErrorAlert/apiErrorCode';
import apiClient, { ApiClientFailureResult, ErrorMessage } from './apiClient';

jest.mock('uuid', () => ({ v4: () => 'correlation-id' }));

const kvitteringsfeil: ErrorMessage[] = [
    {
        code: ApiErrorCode.UTBETALING_AVVENTER_KVITTERING,
        message: 'Tidligere utbetaling mangler kvittering. Prøv igjen senere.',
    },
    {
        code: ApiErrorCode.UTBETALING_HAR_FEILKVITTERING,
        message: 'Tidligere utbetaling har feilkvittering som må avklares.',
    },
    {
        code: ApiErrorCode.UTBETALING_HAR_FEILKVITTERING_OG_AVVENTER_KVITTERING,
        message: 'Tidligere utbetalinger har feilkvittering og mangler kvittering.',
    },
];

describe('kvitteringsfeil', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it.each(kvitteringsfeil)('bevarer HTTP 409 med $code som feil', async (body) => {
        jest.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(body, { status: 409 }));

        const result = await apiClient({
            url: '/saker/sak-id/revurderinger/revurdering-id/beregnOgSimuler',
            method: 'POST',
        });

        const expected: ApiClientFailureResult = {
            status: 'error',
            error: { statusCode: 409, correlationId: 'correlation-id', body },
        };
        expect(result).toEqual(expected);
    });

    it.each(kvitteringsfeil)('har norsk feilmelding for $code', ({ code }) => {
        expect(messages[code]).toEqual(expect.any(String));
        expect(messages[code].length).toBeGreaterThan(0);
        expect(messages[code]).not.toBe(code);
    });
});
