import { harVurderingAvvikFraBrukersSvar } from './vilkårUtils';

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
