import { ApiError } from '~src/api/apiClient';

const UGYLDIG_SØKNADSINNHOLD_INPUT_CODE = 'ugyldig_soknadsinnhold_input';

interface BackendValideringsfeil {
    code?: string;
    felt: string;
    begrunnelse: string;
}

export interface FrontendValideringsfeil {
    code: string;
    message: string;
}

const isObj = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isBackendValideringsfeil = (value: unknown): value is BackendValideringsfeil =>
    isObj(value) &&
    typeof value.felt === 'string' &&
    typeof value.begrunnelse === 'string' &&
    (typeof value.code === 'undefined' || typeof value.code === 'string');

export function hentSøknadsinnholdValideringsfeil(error: ApiError): FrontendValideringsfeil[] | null {
    const body: unknown = error.body;
    if (!isObj(body)) return null;

    const bodyCode = typeof body.code === 'string' ? body.code : null;
    if (bodyCode !== UGYLDIG_SØKNADSINNHOLD_INPUT_CODE) return null;

    const errors = Array.isArray(body.errors) ? body.errors.filter(isBackendValideringsfeil) : [];
    if (errors.length === 0) {
        const fallbackMessage = typeof body.message === 'string' ? body.message : 'Ugyldig input';
        return [
            {
                code: bodyCode,
                message: fallbackMessage,
            },
        ];
    }

    return errors.map((errorItem) => ({
        code: typeof errorItem.code === 'string' ? errorItem.code : bodyCode,
        message: `${formatBackendFieldForSummary(errorItem.felt)}: ${errorItem.begrunnelse}`,
    }));
}

function formatBackendFieldForSummary(fieldPath: string): string {
    return fieldPath.replace(/\[(\d+)\]/g, (_, index) => ` ${Number(index) + 1}`).replaceAll('.', ' > ');
}
