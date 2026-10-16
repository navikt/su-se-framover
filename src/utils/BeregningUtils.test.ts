import { InntektOgPensjon } from '~src/types/Søknadinnhold';

import { inntektFelter } from './BeregningUtils';

describe('inntektFelter', () => {
    const lagInntektOgPensjon = (overrides: Partial<InntektOgPensjon> = {}): InntektOgPensjon => ({
        forventetInntekt: null,
        andreYtelserINav: null,
        andreYtelserINavBeløp: null,
        søktAndreYtelserIkkeBehandletBegrunnelse: null,
        trygdeytelserIUtlandet: [],
        pensjon: [],
        ...overrides,
    });

    it('gir ingen felter når inntekt og pensjon mangler', () => {
        expect(inntektFelter(null)).toEqual([]);
    });

    it('gir ingen felter når ingen inntekt er oppgitt', () => {
        expect(inntektFelter(lagInntektOgPensjon())).toEqual([]);
    });

    it('gir ingen felter for beløp på 0 og tom begrunnelse', () => {
        expect(
            inntektFelter(
                lagInntektOgPensjon({
                    forventetInntekt: 0,
                    andreYtelserINavBeløp: 0,
                    søktAndreYtelserIkkeBehandletBegrunnelse: ' ',
                    trygdeytelserIUtlandet: [{ beløp: 0, type: 'ytelse', valuta: 'NOK' }],
                    pensjon: [{ ordning: 'ordning', beløp: 0 }],
                }),
            ),
        ).toEqual([]);
    });

    it('gir forventet inntekt når beløpet er større enn 0', () => {
        expect(inntektFelter(lagInntektOgPensjon({ forventetInntekt: 1 }))).toEqual(['forventetInntekt']);
    });

    it('gir andre ytelser i Nav når beløpet er større enn 0', () => {
        expect(inntektFelter(lagInntektOgPensjon({ andreYtelserINavBeløp: 1 }))).toEqual(['andreYtelserINav']);
    });

    it('gir søkte, ubehandlede ytelser når begrunnelsen har innhold', () => {
        expect(
            inntektFelter(
                lagInntektOgPensjon({
                    søktAndreYtelserIkkeBehandletBegrunnelse: 'Venter på svar',
                }),
            ),
        ).toEqual(['søktAndreYtelserIkkeBehandletBegrunnelse']);
    });

    it('gir utenlandske trygdeytelser og pensjon når minst ett beløp er større enn 0', () => {
        expect(
            inntektFelter(
                lagInntektOgPensjon({
                    trygdeytelserIUtlandet: [
                        { beløp: 0, type: 'ytelse 1', valuta: 'NOK' },
                        { beløp: 1, type: 'ytelse 2', valuta: 'SEK' },
                    ],
                    pensjon: [
                        { ordning: 'ordning 1', beløp: 0 },
                        { ordning: 'ordning 2', beløp: 1 },
                    ],
                }),
            ),
        ).toEqual(['trygdeytelserIUtlandet', 'pensjon']);
    });
});
