import { BosituasjonFormItemData } from '~src/components/forms/vilkårOgGrunnlagForms/bosituasjon/BosituasjonFormUtils';
import { FormuegrunnlagVerdierFormData } from '~src/components/forms/vilkårOgGrunnlagForms/formue/FormueFormUtils';
import { DelerBoligMed } from '~src/features/søknad/types';
import { Boforhold, Formue } from '~src/types/Søknadinnhold';

import {
    bosituasjonFelterMedAvvikFraSøknad,
    formueFelterMedAvvikFraSøknad,
    harVurderingAvvikFraBrukersSvar,
} from './vilkårUtils';

describe('harVurderingAvvikFraBrukersSvar', () => {
    it('gir avvik når bruker svarte ja, men saksbehandler har vurdert vilkåret som ikke oppfylt', () => {
        expect(harVurderingAvvikFraBrukersSvar(true, [false])).toEqual(true);
    });

    it('gir avvik når bruker svarte nei, men saksbehandler har vurdert vilkåret som oppfylt', () => {
        expect(harVurderingAvvikFraBrukersSvar(false, [true])).toEqual(true);
    });

    it('gir ikke avvik når saksbehandlers vurdering samsvarer med brukers svar', () => {
        expect(harVurderingAvvikFraBrukersSvar(true, [true])).toEqual(false);
        expect(harVurderingAvvikFraBrukersSvar(false, [false])).toEqual(false);
    });

    it('gir ikke avvik når saksbehandler ikke har tatt stilling (uavklart/null)', () => {
        expect(harVurderingAvvikFraBrukersSvar(true, [null])).toEqual(false);
    });

    it('gir ikke avvik når brukers svar er ukjent', () => {
        expect(harVurderingAvvikFraBrukersSvar(null, [false])).toEqual(false);
    });

    it('gir avvik hvis minst én av flere perioder avviker', () => {
        expect(harVurderingAvvikFraBrukersSvar(true, [true, false])).toEqual(true);
    });
});

describe('formueFelterMedAvvikFraSøknad', () => {
    const lagSøknadsFormue = (overrides: Partial<Formue> = {}): Formue => ({
        borIBolig: true,
        verdiPåBolig: 100,
        boligBrukesTil: null,
        depositumsBeløp: 200,
        verdiPåEiendom: 300,
        eiendomBrukesTil: null,
        kjøretøy: [{ verdiPåKjøretøy: 400, kjøretøyDeEier: 'bil' }],
        innskuddsBeløp: 500,
        verdipapirBeløp: 600,
        skylderNoenMegPengerBeløp: 700,
        kontanterBeløp: 800,
        ...overrides,
    });

    const lagVurdering = (overrides: Partial<FormuegrunnlagVerdierFormData> = {}): FormuegrunnlagVerdierFormData => ({
        verdiIkkePrimærbolig: '100',
        verdiEiendommer: '300',
        verdiKjøretøy: '400',
        innskudd: '500',
        verdipapir: '600',
        pengerSkyldt: '700',
        kontanter: '800',
        depositumskonto: '200',
        ...overrides,
    });

    it('gir ingen avvik når vurderingen samsvarer med søknaden', () => {
        expect(formueFelterMedAvvikFraSøknad(lagSøknadsFormue(), [lagVurdering()])).toEqual([]);
    });

    it('gir avvik på bolig når saksbehandler har endret verdien', () => {
        expect(
            formueFelterMedAvvikFraSøknad(lagSøknadsFormue(), [lagVurdering({ verdiIkkePrimærbolig: '999' })]),
        ).toEqual(['verdiIkkePrimærbolig']);
    });

    it('sammenligner kjøretøy som sum av alle kjøretøy i søknaden', () => {
        const søknadsFormue = lagSøknadsFormue({
            kjøretøy: [
                { verdiPåKjøretøy: 100, kjøretøyDeEier: 'bil' },
                { verdiPåKjøretøy: 300, kjøretøyDeEier: 'mc' },
            ],
        });
        expect(formueFelterMedAvvikFraSøknad(søknadsFormue, [lagVurdering({ verdiKjøretøy: '400' })])).toEqual([]);
        expect(formueFelterMedAvvikFraSøknad(søknadsFormue, [lagVurdering({ verdiKjøretøy: '999' })])).toEqual([
            'verdiKjøretøy',
        ]);
    });

    it('gir avvik på flere felter samtidig', () => {
        expect(
            formueFelterMedAvvikFraSøknad(lagSøknadsFormue(), [lagVurdering({ innskudd: '0', kontanter: '0' })]),
        ).toEqual(['innskudd', 'kontanter']);
    });

    it('gir avvik hvis minst én av flere perioder avviker', () => {
        expect(
            formueFelterMedAvvikFraSøknad(lagSøknadsFormue(), [lagVurdering(), lagVurdering({ verdipapir: '0' })]),
        ).toEqual(['verdipapir']);
    });

    it('filtrerer bort vurderinger som er null, f.eks. eps-formue når det ikke finnes eps', () => {
        expect(formueFelterMedAvvikFraSøknad(lagSøknadsFormue(), [null])).toEqual([]);
    });

    it('gir ingen avvik når søknaden ikke har formue og vurderingen er tom (alt 0)', () => {
        const tomVurdering: FormuegrunnlagVerdierFormData = {
            verdiIkkePrimærbolig: '0',
            verdiEiendommer: '0',
            verdiKjøretøy: '0',
            innskudd: '0',
            verdipapir: '0',
            pengerSkyldt: '0',
            kontanter: '0',
            depositumskonto: '0',
        };
        expect(formueFelterMedAvvikFraSøknad(null, [tomVurdering])).toEqual([]);
    });
});

describe('bosituasjonFelterMedAvvikFraSøknad', () => {
    const lagBoforhold = (overrides: Partial<Boforhold> = {}): Boforhold => ({
        borOgOppholderSegINorge: true,
        delerBoligMedVoksne: true,
        delerBoligMed: DelerBoligMed.EKTEMAKE_SAMBOER,
        ektefellePartnerSamboer: {
            fnr: '98765431312',
            erUførFlyktning: false,
        },
        innlagtPåInstitusjon: null,
        borPåAdresse: null,
        ingenAdresseGrunn: null,
        ...overrides,
    });

    const lagVurdering = (overrides: Partial<BosituasjonFormItemData> = {}): BosituasjonFormItemData => ({
        periode: {
            fraOgMed: null,
            tilOgMed: null,
        },
        harEPS: true,
        epsFnr: '98765431312',
        delerBolig: null,
        erEpsFylt67: false,
        erEPSUførFlyktning: false,
        ...overrides,
    });

    it('gir ingen avvik når vurderingen samsvarer med søknaden', () => {
        expect(bosituasjonFelterMedAvvikFraSøknad(lagBoforhold(), [lagVurdering()])).toEqual([]);
    });

    it('gir avvik når saksbehandler har vurdert at søkeren ikke har EPS', () => {
        expect(bosituasjonFelterMedAvvikFraSøknad(lagBoforhold(), [lagVurdering({ harEPS: false })])).toEqual([
            'harEPS',
        ]);
    });

    it('gir avvik når EPS-fødselsnummeret er endret', () => {
        expect(bosituasjonFelterMedAvvikFraSøknad(lagBoforhold(), [lagVurdering({ epsFnr: '12345678901' })])).toEqual([
            'epsFnr',
        ]);
    });

    it('gir avvik når vurderingen av om EPS er ufør flyktning, er endret', () => {
        expect(
            bosituasjonFelterMedAvvikFraSøknad(lagBoforhold(), [lagVurdering({ erEPSUførFlyktning: true })]),
        ).toEqual(['erEPSUførFlyktning']);
    });

    it('gir avvik når vurderingen av om søkeren deler bolig, er endret', () => {
        const boforholdUtenEps = lagBoforhold({
            delerBoligMed: DelerBoligMed.VOKSNE_BARN,
            ektefellePartnerSamboer: null,
        });
        const vurderingUtenEps = lagVurdering({
            harEPS: false,
            epsFnr: null,
            delerBolig: false,
            erEPSUførFlyktning: null,
        });

        expect(bosituasjonFelterMedAvvikFraSøknad(boforholdUtenEps, [vurderingUtenEps])).toEqual(['delerBolig']);
    });

    it('sjekker ikke EPS-felter når søknaden ikke har EPS', () => {
        const boforholdUtenEps = lagBoforhold({
            delerBoligMed: DelerBoligMed.VOKSNE_BARN,
            ektefellePartnerSamboer: null,
        });
        const vurderingUtenEps = lagVurdering({
            harEPS: false,
            epsFnr: '12345678901',
            delerBolig: true,
            erEPSUførFlyktning: true,
        });

        expect(bosituasjonFelterMedAvvikFraSøknad(boforholdUtenEps, [vurderingUtenEps])).toEqual([]);
    });

    it('gir avvik hvis minst én av flere perioder avviker', () => {
        expect(
            bosituasjonFelterMedAvvikFraSøknad(lagBoforhold(), [
                lagVurdering(),
                lagVurdering({ erEPSUførFlyktning: true }),
            ]),
        ).toEqual(['erEPSUførFlyktning']);
    });

    it('filtrerer bort vurderinger som er null', () => {
        expect(bosituasjonFelterMedAvvikFraSøknad(lagBoforhold(), [null])).toEqual([]);
    });
});
