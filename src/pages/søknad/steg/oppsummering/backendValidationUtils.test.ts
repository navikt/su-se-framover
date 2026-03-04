import { ApiError } from '~src/api/apiClient';

import { hentSøknadsinnholdValideringsfeil } from './backendValidationUtils';

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

    it('viser listeelement med løpenummer når felt er i array', () => {
        const res = hentSøknadsinnholdValideringsfeil(
            lagApiError({
                code: 'ugyldig_soknadsinnhold_input',
                errors: [
                    {
                        code: 'ugyldig_soknadsinnhold_input',
                        felt: 'formue.kjøretøy[0].kjøretøyDeEier',
                        begrunnelse: 'mangler verdi',
                    },
                ],
            }),
        );

        expect(res).toEqual([
            {
                code: 'ugyldig_soknadsinnhold_input',
                message: 'formue > kjøretøy 1 > kjøretøyDeEier: mangler verdi',
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
                        felt: 'inntektOgPensjon.andreYtelserINav',
                        begrunnelse: 'inneholder kontrolltegn',
                    },
                ],
            }),
        );

        expect(res).toEqual([
            {
                code: 'ugyldig_soknadsinnhold_input',
                message: 'inntektOgPensjon > andreYtelserINav: inneholder kontrolltegn',
            },
        ]);
    });

    it('bruker top-level code når en error-rad mangler code', () => {
        const res = hentSøknadsinnholdValideringsfeil(
            lagApiError({
                code: 'ugyldig_soknadsinnhold_input',
                errors: [
                    {
                        felt: 'inntektOgPensjon.andreYtelserINav',
                        begrunnelse: 'inneholder kontrolltegn',
                    },
                ],
            }),
        );

        expect(res).toEqual([
            {
                code: 'ugyldig_soknadsinnhold_input',
                message: 'inntektOgPensjon > andreYtelserINav: inneholder kontrolltegn',
            },
        ]);
    });

    it('faller tilbake til top-level message når errors finnes men ikke har felt/begrunnelse', () => {
        const res = hentSøknadsinnholdValideringsfeil(
            lagApiError({
                code: 'ugyldig_soknadsinnhold_input',
                message: 'Ugyldig søknadsinnhold',
                errors: [
                    {
                        code: 'ugyldig_soknadsinnhold_input',
                        felt: 'inntektOgPensjon.pensjon[1].ordning',
                    },
                ],
            }),
        );

        expect(res).toEqual([
            {
                code: 'ugyldig_soknadsinnhold_input',
                message: 'Ugyldig søknadsinnhold',
            },
        ]);
    });
});
