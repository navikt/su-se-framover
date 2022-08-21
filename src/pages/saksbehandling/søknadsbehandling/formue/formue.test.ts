import {
    FormuegrunnlagVerdierFormData,
    regnUtFormuegrunnlagVerdier,
} from '~src/components/vilkårForms/formue/FormueFormUtils';
import { FormuegrunnlagVerdier } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuegrunnlag';
import { kalkulerFormueFraSøknad } from '~src/utils/søknadsbehandling/formue/formueUtils';

describe('kalkulation for formue', () => {
    const formue: FormuegrunnlagVerdierFormData = {
        verdiIkkePrimærbolig: '1000',
        verdiEiendommer: '1000',
        verdiKjøretøy: '1000',
        innskudd: '1000',
        verdipapir: '1000',
        pengerSkyldt: '1000',
        kontanter: '1000',
        depositumskonto: '1000',
    };

    const formueFraSøknad = {
        borIBolig: true,
        verdiPåBolig: 1000,
        boligBrukesTil: '',
        depositumsBeløp: 1000,
        verdiPåEiendom: 1000,
        eiendomBrukesTil: '',
        kjøretøy: [{ verdiPåKjøretøy: 1000, kjøretøyDeEier: '' }],
        innskuddsBeløp: 1000,
        verdipapirBeløp: 1000,
        skylderNoenMegPengerBeløp: 1000,
        kontanterBeløp: 1000,
    };

    it('utregning av formue skal trekke fra depositumskonto', () => {
        expect(regnUtFormuegrunnlagVerdier(formue)).toBe(6000);
    });

    it('total formue kan ikke bli negativ', () => {
        const formueMedHøyDepositumskonto: FormuegrunnlagVerdierFormData = {
            ...formue,
            depositumskonto: '100000000',
        };
        expect(regnUtFormuegrunnlagVerdier(formueMedHøyDepositumskonto)).toBe(6000);
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
            verdiIkkePrimærbolig: '0',
            verdiEiendommer: '0',
            verdiKjøretøy: '0',
            innskudd: '0',
            verdipapir: '0',
            pengerSkyldt: '0',
            kontanter: '0',
            depositumskonto: '2000',
        };

        expect(regnUtFormuegrunnlagVerdier(f)).toBe(0);
    });

    it('trekking av depositumskonto fra innskudd kan ikke bli negativ', () => {
        const f = {
            borIBolig: true,
            verdiPåBolig: 0,
            boligBrukesTil: '',
            depositumsBeløp: 100000,
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
        const verdier: FormuegrunnlagVerdier = {
            verdiIkkePrimærbolig: 1000,
            verdiEiendommer: 1000,
            verdiKjøretøy: 1000,
            innskudd: 1000,
            verdipapir: 1000,
            pengerSkyldt: 1000,
            kontanter: 1000,
            depositumskonto: 1000,
        };

        expect(regnUtFormuegrunnlagVerdier(verdier)).toBe(6000);
    });
});
