import { FormuegrunnlagVerdierFormData } from '~src/components/forms/vilkårOgGrunnlagForms/formue/FormueFormUtils';
import { GrunnForPapirinnsending, Vergemål } from '~src/features/søknad/types';
import { PersonligOppmøteÅrsak } from '~src/types/grunnlagsdataOgVilkårsvurderinger/personligOppmøte/PersonligOppmøteVilkår';
import { Formue, ForNav, Søknadstype } from '~src/types/Søknadinnhold';

import {
    formueFelterMedAvvikFraSøknad,
    forventetÅrsakIfølgeSøknad,
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

describe('forventetÅrsakIfølgeSøknad', () => {
    it('forventer møtt personlig når digital søknad ikke har fullmektig eller verge', () => {
        const forNav: ForNav = { type: Søknadstype.DigitalSøknad, harFullmektigEllerVerge: null };
        expect(forventetÅrsakIfølgeSøknad(forNav)).toEqual(PersonligOppmøteÅrsak.MøttPersonlig);
    });

    it('forventer ikke møtt men verge når digital søknad har verge', () => {
        const forNav: ForNav = { type: Søknadstype.DigitalSøknad, harFullmektigEllerVerge: Vergemål.Verge };
        expect(forventetÅrsakIfølgeSøknad(forNav)).toEqual(PersonligOppmøteÅrsak.IkkeMøttMenVerge);
    });

    it('gir ingen entydig forventning når digital søknad har fullmektig', () => {
        const forNav: ForNav = { type: Søknadstype.DigitalSøknad, harFullmektigEllerVerge: Vergemål.Fullmektig };
        expect(forventetÅrsakIfølgeSøknad(forNav)).toEqual(null);
    });

    it('forventer ikke møtt men verge når papirsøknad skyldes at verge har søkt på vegne av bruker', () => {
        const forNav: ForNav = {
            type: Søknadstype.Papirsøknad,
            mottaksdatoForSøknad: '2023-01-01',
            grunnForPapirinnsending: GrunnForPapirinnsending.VergeHarSøktPåVegneAvBruker,
            annenGrunn: null,
        };
        expect(forventetÅrsakIfølgeSøknad(forNav)).toEqual(PersonligOppmøteÅrsak.IkkeMøttMenVerge);
    });

    it('forventer midlertidig unntak når papirsøknad skyldes midlertidig unntak fra oppmøteplikt', () => {
        const forNav: ForNav = {
            type: Søknadstype.Papirsøknad,
            mottaksdatoForSøknad: '2023-01-01',
            grunnForPapirinnsending: GrunnForPapirinnsending.MidlertidigUnntakFraOppmøteplikt,
            annenGrunn: null,
        };
        expect(forventetÅrsakIfølgeSøknad(forNav)).toEqual(
            PersonligOppmøteÅrsak.IkkeMøttMenMidlertidigUnntakFraOppmøteplikt,
        );
    });

    it('gir ingen entydig forventning når papirsøknad skyldes annen grunn', () => {
        const forNav: ForNav = {
            type: Søknadstype.Papirsøknad,
            mottaksdatoForSøknad: '2023-01-01',
            grunnForPapirinnsending: GrunnForPapirinnsending.Annet,
            annenGrunn: 'sykdom',
        };
        expect(forventetÅrsakIfølgeSøknad(forNav)).toEqual(null);
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
