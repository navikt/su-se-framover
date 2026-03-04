import { ApiError } from '~src/api/apiClient';

import {
    applyBackendErrorsToRHF,
    hentBackendSøknadsinnholdValideringsfeil,
    hentSøknadsinnholdValideringsfeil,
} from './backendValidationUtils';

const lagApiError = (body: unknown): ApiError => ({
    statusCode: 400,
    correlationId: 'test-correlation-id',
    body: body as ApiError['body'],
});

describe('hentSøknadsinnholdValideringsfeil', () => {
    it('returnerer null når code ikke er ugyldig_soknadsinnhold_input', () => {
        const res = hentSøknadsinnholdValideringsfeil(
            lagApiError({
                code: 'ugyldig_input',
                message: 'Ugyldig input',
            }),
        );

        expect(res).toBeNull();
    });

    it('bruker top-level message når errors mangler', () => {
        const res = hentSøknadsinnholdValideringsfeil(
            lagApiError({
                code: 'ugyldig_soknadsinnhold_input',
                message: 'Ugyldig input i innsending',
            }),
        );

        expect(res).toEqual([
            {
                code: 'ugyldig_soknadsinnhold_input',
                message: 'Ugyldig input i innsending',
            },
        ]);
    });

    it('viser felt og begrunnelse direkte når felt er i array', () => {
        const res = hentSøknadsinnholdValideringsfeil(
            lagApiError({
                code: 'ugyldig_soknadsinnhold_input',
                errors: [
                    {
                        code: 'ugyldig_soknadsinnhold_input',
                        felt: 'formue.kjøretøy.0.kjøretøyDeEier',
                        begrunnelse: 'mangler verdi',
                    },
                ],
            }),
        );

        expect(res).toEqual([
            {
                code: 'ugyldig_soknadsinnhold_input',
                message: 'formue.kjøretøy.0.kjøretøyDeEier: mangler verdi',
            },
        ]);
    });

    it('beholder rå feltsti når felt ikke er i array', () => {
        const res = hentSøknadsinnholdValideringsfeil(
            lagApiError({
                code: 'ugyldig_soknadsinnhold_input',
                errors: [
                    {
                        code: 'ugyldig_soknadsinnhold_input',
                        felt: 'inntekt.andreYtelserINav',
                        begrunnelse: 'inneholder kontrolltegn',
                    },
                ],
            }),
        );

        expect(res).toEqual([
            {
                code: 'ugyldig_soknadsinnhold_input',
                message: 'inntekt.andreYtelserINav: inneholder kontrolltegn',
            },
        ]);
    });

    it('bruker top-level code når en error-rad mangler code', () => {
        const res = hentSøknadsinnholdValideringsfeil(
            lagApiError({
                code: 'ugyldig_soknadsinnhold_input',
                errors: [
                    {
                        felt: 'inntekt.andreYtelserINav',
                        begrunnelse: 'inneholder kontrolltegn',
                    },
                ],
            }),
        );

        expect(res).toEqual([
            {
                code: 'ugyldig_soknadsinnhold_input',
                message: 'inntekt.andreYtelserINav: inneholder kontrolltegn',
            },
        ]);
    });
});

describe('hentBackendSøknadsinnholdValideringsfeil', () => {
    it('returnerer raw backend-feil når kontrakten matcher', () => {
        const res = hentBackendSøknadsinnholdValideringsfeil(
            lagApiError({
                code: 'ugyldig_soknadsinnhold_input',
                message: 'Ugyldig søknadsinnhold',
                errors: [
                    {
                        felt: 'inntekt.andreYtelserINav',
                        begrunnelse: 'inneholder kontrolltegn',
                    },
                ],
            }),
        );

        expect(res).toEqual({
            code: 'ugyldig_soknadsinnhold_input',
            message: 'Ugyldig søknadsinnhold',
            errors: [
                {
                    felt: 'inntekt.andreYtelserINav',
                    begrunnelse: 'inneholder kontrolltegn',
                },
            ],
        });
    });
});

describe('applyBackendErrorsToRHF', () => {
    it('mapper DTO-feltsti til RHF-feltsti før setError', () => {
        const setError = jest.fn();

        applyBackendErrorsToRHF(
            [
                {
                    felt: 'inntektOgPensjon.pensjon.0.ordning',
                    begrunnelse: 'må være et tall',
                },
            ],
            setError as never,
        );

        expect(setError).toHaveBeenCalledWith('inntekt.pensjonsInntekt.0.ordning', {
            type: 'server',
            message: 'må være et tall',
        });
    });
});
