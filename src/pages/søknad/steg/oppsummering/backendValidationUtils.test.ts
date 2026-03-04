import { ApiError } from '~src/api/apiClient';
import { Sakstype } from '~src/types/Sak';

import { hentSøknadsinnholdValideringsfeil, mapBackendFieldPathToFrontendFieldPath } from './backendValidationUtils';

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
            Sakstype.Alder,
        );

        expect(res).toBeNull();
    });

    it('bruker top-level message når errors mangler', () => {
        const res = hentSøknadsinnholdValideringsfeil(
            lagApiError({
                code: 'ugyldig_soknadsinnhold_input',
                message: 'Ugyldig input i innsending',
            }),
            Sakstype.Alder,
        );

        expect(res).toEqual([
            {
                code: 'ugyldig_soknadsinnhold_input',
                message: 'Ugyldig input i innsending',
            },
        ]);
    });

    it('mapper backend feltsti til frontend feltnavn', () => {
        const res = hentSøknadsinnholdValideringsfeil(
            lagApiError({
                code: 'ugyldig_soknadsinnhold_input',
                message: 'Ugyldig input',
                errors: [
                    {
                        code: 'ugyldig_soknadsinnhold_input',
                        message: 'Ugyldig input i felt formue.kjøretøy[0].kjøretøyDeEier: mangler verdi',
                        felt: 'formue.kjøretøy[0].kjøretøyDeEier',
                    },
                ],
            }),
            Sakstype.Alder,
        );

        expect(res).toEqual([
            {
                code: 'ugyldig_soknadsinnhold_input',
                message: 'Ugyldig input i felt formue.kjøretøy[0].kjøretøyDeEier: mangler verdi',
                field: 'formue.kjøretøy.0.kjøretøyDeEier',
            },
        ]);
    });

    it('utleder feltsti fra message dersom felt ikke er eksplisitt satt', () => {
        const res = hentSøknadsinnholdValideringsfeil(
            lagApiError({
                code: 'ugyldig_soknadsinnhold_input',
                errors: [
                    {
                        code: 'ugyldig_soknadsinnhold_input',
                        message: 'Ugyldig input i felt inntektOgPensjon.pensjon[1].ordning: må fylles ut',
                    },
                ],
            }),
            Sakstype.Alder,
        );

        expect(res).toEqual([
            {
                code: 'ugyldig_soknadsinnhold_input',
                message: 'Ugyldig input i felt inntektOgPensjon.pensjon[1].ordning: må fylles ut',
                field: 'inntekt.pensjonsInntekt.1.ordning',
            },
        ]);
    });
});

describe('mapBackendFieldPathToFrontendFieldPath', () => {
    it('mapper oppholdstillatelse til flyktningstatus for uføresøknad', () => {
        const res = mapBackendFieldPathToFrontendFieldPath(
            'oppholdstillatelse.statsborgerskapAndreLandFritekst',
            Sakstype.Uføre,
        );

        expect(res).toBe('flyktningstatus.statsborgerskapAndreLandFritekst');
    });

    it('mapper flyktningsstatus.registrertFlyktning til flyktningstatus.erFlyktning', () => {
        const res = mapBackendFieldPathToFrontendFieldPath('flyktningsstatus.registrertFlyktning', Sakstype.Uføre);

        expect(res).toBe('flyktningstatus.erFlyktning');
    });
});
