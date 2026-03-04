import { FieldValues, UseFormSetError } from 'react-hook-form';

import { ApiError } from '~src/api/apiClient';

const UGYLDIG_SØKNADSINNHOLD_INPUT_CODE = 'ugyldig_soknadsinnhold_input';

export interface BackendValideringsfeil {
    code?: string;
    felt: string;
    begrunnelse: string;
}

export interface BackendSøknadsinnholdValideringsfeil {
    code: string;
    message?: string;
    errors: BackendValideringsfeil[];
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
        return [{ code, message: fallbackMessage }];
    }

    return errors.map((errorItem) => ({
        code: typeof errorItem.code === 'string' ? errorItem.code : code,
        message: `${errorItem.felt}: ${errorItem.begrunnelse}`,
    }));
}

export function applyBackendErrorsToRHF<TFieldValues extends FieldValues>(
    errors: BackendValideringsfeil[],
    setError: UseFormSetError<TFieldValues>,
) {
    for (const errorItem of errors) {
        setError(dtoToRhfFieldPath(errorItem.felt) as never, {
            type: 'server',
            message: errorItem.begrunnelse,
        });
    }
}

function dtoToRhfFieldPath(path: string): string {
    let mappedPath = path;

    if (mappedPath.startsWith('ektefelle.inntektOgPensjon.')) {
        mappedPath = mappedPath.replace('ektefelle.inntektOgPensjon.', 'ektefelle.inntekt.');
    } else if (mappedPath.startsWith('inntektOgPensjon.')) {
        mappedPath = mappedPath.replace('inntektOgPensjon.', 'inntekt.');
    } else if (mappedPath.startsWith('boforhold.')) {
        mappedPath = mappedPath.replace('boforhold.', 'boOgOpphold.');
    } else if (mappedPath.startsWith('forNav.')) {
        mappedPath = mappedPath.replace('forNav.', 'forVeileder.');
    }

    return mappedPath
        .split('.')
        .map((segment) => (segment === 'pensjon' ? 'pensjonsInntekt' : segment))
        .join('.');
}
