import { ApiError } from '~src/api/apiClient';

const UGYLDIG_SØKNADSINNHOLD_INPUT_CODE = 'ugyldig_soknadsinnhold_input';

export interface BackendValideringsfeil {
    felt: string;
    begrunnelse: string;
}

export interface BackendSøknadsinnholdValideringsfeil {
    code: string;
    message?: string;
    errors: BackendValideringsfeil[];
}

export interface FrontendValideringsfeil {
    feltSti: string;
    begrunnelse: string;
}

const isObj = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isBackendValideringsfeil = (value: unknown): value is BackendValideringsfeil =>
    isObj(value) && typeof value.felt === 'string' && typeof value.begrunnelse === 'string';

export function hentBackendSøknadsinnholdValideringsfeil(error: ApiError): BackendSøknadsinnholdValideringsfeil | null {
    const body: unknown = error.body;
    if (!isObj(body)) return null;

    const bodyCode = typeof body.code === 'string' ? body.code : null;
    if (bodyCode !== UGYLDIG_SØKNADSINNHOLD_INPUT_CODE) return null;

    return {
        code: bodyCode,
        message: typeof body.message === 'string' ? body.message : undefined,
        errors: Array.isArray(body.errors) ? body.errors.filter(isBackendValideringsfeil) : [],
    };
}

export function hentSøknadsinnholdValideringsfeil(error: ApiError): FrontendValideringsfeil[] | null {
    const backendErrors = hentBackendSøknadsinnholdValideringsfeil(error);
    if (!backendErrors) return null;

    const { code, errors, message } = backendErrors;

    if (errors.length === 0) {
        const fallbackMessage = message ?? 'Ugyldig input';
        return [{ feltSti: code, begrunnelse: fallbackMessage }];
    }

    return errors.map((errorItem) => ({
        feltSti: errorItem.felt,
        begrunnelse: errorItem.begrunnelse,
    }));
}
