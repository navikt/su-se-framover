import { FormueVerdier } from '~types/Behandlingsinformasjon';
import { kalkulerFormueFraSøknad, regnUtFormueVerdier } from '~Utils/søknadsbehandling/formue/formueUtils';
import {
    regnUtFormDataVerdier,
    VerdierFormData,
} from '~Utils/søknadsbehandlingOgRevurdering/formue/formueSøbOgRevUtils';

describe('kalkulation for formue', () => {
    const formue: VerdierFormData = {
        verdiPåBolig: '1000',
        verdiPåEiendom: '1000',
        verdiPåKjøretøy: '1000',
        innskuddsbeløp: '1000',
        verdipapir: '1000',
        stårNoenIGjeldTilDeg: '1000',
        kontanterOver1000: '1000',
        depositumskonto: '1000',
    };

    const formueFraSøknad = {
        borIBolig: true,
        verdiPåBolig: 1000,
        boligBrukesTil: '',
        depositumsBeløp: 1000,
        kontonummer: '',
        verdiPåEiendom: 1000,
        eiendomBrukesTil: '',
        kjøretøy: [{ verdiPåKjøretøy: 1000, kjøretøyDeEier: '' }],
        innskuddsBeløp: 1000,
        verdipapirBeløp: 1000,
        skylderNoenMegPengerBeløp: 1000,
        kontanterBeløp: 1000,
    };

    it('utregning av formue skal trekke fra depositumskonto', () => {
        expect(regnUtFormDataVerdier(formue)).toBe(6000);
    });

    it('total formue kan ikke bli negativ', () => {
        const formueMedHøyDepositumskonto: VerdierFormData = {
            ...formue,
            depositumskonto: '100000000',
        };
        expect(regnUtFormDataVerdier(formueMedHøyDepositumskonto)).toBe(6000);
    });

    it('utregning av formue fra søknad skal trekke fra depositumskonto', () => {
        expect(kalkulerFormueFraSøknad(formueFraSøknad)).toBe(6000);
    });

    it('total formue fra søknad kan ikke bli negativ', () => {
        const formueFraSøknadMedHøyDepositumskonto = {
            ...formueFraSøknad,
            depositumskonto: 100000000,
        };
        expect(kalkulerFormueFraSøknad(formueFraSøknadMedHøyDepositumskonto)).toBe(6000);
    });

    it('trekking av depositumskonto fra innskudd kan ikke bli negativ', () => {
        const f = {
            verdiPåBolig: '0',
            verdiPåEiendom: '0',
            verdiPåKjøretøy: '0',
            innskuddsbeløp: '0',
            verdipapir: '0',
            stårNoenIGjeldTilDeg: '0',
            kontanterOver1000: '0',
            depositumskonto: '2000',
        };

        expect(regnUtFormDataVerdier(f)).toBe(0);
    });

    it('trekking av depositumskonto fra innskudd kan ikke bli negativ', () => {
        const f = {
            borIBolig: true,
            verdiPåBolig: 0,
            boligBrukesTil: '',
            depositumsBeløp: 100000,
            kontonummer: '',
            verdiPåEiendom: 0,
            eiendomBrukesTil: '',
            kjøretøy: [{ verdiPåKjøretøy: 0, kjøretøyDeEier: '' }],
            innskuddsBeløp: 1000,
            verdipapirBeløp: 0,
            skylderNoenMegPengerBeløp: 0,
            kontanterBeløp: 0,
        };

        expect(kalkulerFormueFraSøknad(f)).toBe(0);
    });

    it('regner ut formueVerdier', () => {
        const verdier: FormueVerdier = {
            verdiIkkePrimærbolig: 1000,
            verdiEiendommer: 1000,
            verdiKjøretøy: 1000,
            innskudd: 1000,
            verdipapir: 1000,
            pengerSkyldt: 1000,
            kontanter: 1000,
            depositumskonto: 1000,
        };

        expect(regnUtFormueVerdier(verdier)).toBe(6000);
    });
});
