import { ApiError } from '~src/api/apiClient';
import { Sakstype } from '~src/types/Sak';

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
    it.each([
        ['inntektOgPensjon.pensjon.0.ordning', Sakstype.Alder, 'inntekt.pensjonsInntekt.0.ordning'],
        ['ektefelle.inntektOgPensjon.pensjon.0.beløp', Sakstype.Alder, 'ektefelle.inntekt.pensjonsInntekt.0.beløp'],
        ['boforhold.borOgOppholderSegINorge', Sakstype.Alder, 'boOgOpphold.borOgOppholderSegINorge'],
        ['boforhold.innlagtPåInstitusjon.datoForInnleggelse', Sakstype.Alder, 'boOgOpphold.datoForInnleggelse'],
        ['forNav.harFullmektigEllerVerge', Sakstype.Alder, 'forVeileder.harFullmektigEllerVerge'],
        ['oppholdstillatelseAlder.eøsborger', Sakstype.Alder, 'oppholdstillatelse.eøsborger'],
        ['harSøktAlderspensjon.harSøktAlderspensjon', Sakstype.Alder, 'harSøktAlderspensjon'],
        ['oppholdstillatelse.statsborgerskapAndreLand', Sakstype.Uføre, 'flyktningstatus.statsborgerskapAndreLand'],
        ['flyktningsstatus.registrertFlyktning', Sakstype.Uføre, 'flyktningstatus.erFlyktning'],
        ['uførevedtak.harUførevedtak', Sakstype.Uføre, 'harUførevedtak'],
        ['formue.kjøretøy.0.verdiPåKjøretøy', Sakstype.Alder, 'formue.kjøretøy.0.verdiPåKjøretøy'],
    ])('mapper %s (sakstype: %s) -> %s', (felt, sakstype, expectedField) => {
        const setError = jest.fn();

        applyBackendErrorsToRHF(
            [
                {
                    felt,
                    begrunnelse: 'må være et tall',
                },
            ],
            setError as never,
            sakstype,
        );

        expect(setError).toHaveBeenCalledWith(expectedField, {
            type: 'server',
            message: 'må være et tall',
        });
    });
});

describe('submit-feil flyt', () => {
    it('lager oppsummeringsfeil og setter RHF-feil på mappet feltsti', () => {
        const apiError = lagApiError({
            code: 'ugyldig_soknadsinnhold_input',
            errors: [
                {
                    felt: 'inntektOgPensjon.pensjon.0.ordning',
                    begrunnelse: 'må fylles ut',
                },
            ],
        });
        const setError = jest.fn();

        const summaryErrors = hentSøknadsinnholdValideringsfeil(apiError);
        const backendErrors = hentBackendSøknadsinnholdValideringsfeil(apiError);
        expect(backendErrors).not.toBeNull();

        applyBackendErrorsToRHF(backendErrors!.errors, setError as never, Sakstype.Alder);

        expect(summaryErrors).toEqual([
            {
                code: 'ugyldig_soknadsinnhold_input',
                message: 'inntektOgPensjon.pensjon.0.ordning: må fylles ut',
            },
        ]);

        expect(setError).toHaveBeenCalledWith('inntekt.pensjonsInntekt.0.ordning', {
            type: 'server',
            message: 'må fylles ut',
        });
    });
});
