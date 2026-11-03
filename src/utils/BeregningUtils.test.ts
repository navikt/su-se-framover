import { Beregning, Månedsberegning } from '~src/types/Beregning';
import {
    Fradrag,
    FradragTilhører,
    IkkeVelgbareFradragskategorier,
    VelgbareFradragskategorier,
} from '~src/types/Fradrag';
import { Sats } from '~src/types/Sats';
import { InntektOgPensjon } from '~src/types/Søknadinnhold';

import {
    erFradragValgtForMåned,
    getBeregningsgrunnlagForMåned,
    grupperMånedsberegningerMedGrunnlag,
    inntektFelter,
} from './BeregningUtils';

describe('beregningsgrunnlag og valgte fradrag', () => {
    const januar = { fraOgMed: '2026-01-01', tilOgMed: '2026-01-31' };
    const februar = { fraOgMed: '2026-02-01', tilOgMed: '2026-02-28' };
    const helePerioden = { fraOgMed: januar.fraOgMed, tilOgMed: februar.tilOgMed };
    const forventetInntekt: Fradrag = {
        periode: helePerioden,
        type: IkkeVelgbareFradragskategorier.ForventetInntekt,
        beskrivelse: null,
        beløp: 10 / 12,
        utenlandskInntekt: null,
        tilhører: FradragTilhører.Bruker,
    };
    const arbeidsinntekt: Fradrag = {
        ...forventetInntekt,
        type: VelgbareFradragskategorier.Arbeidsinntekt,
        beløp: 15000,
    };
    const lagMåned = (overrides: Partial<Månedsberegning> = {}): Månedsberegning => ({
        ...januar,
        sats: Sats.Høy,
        satsbeløp: 25000,
        grunnbeløp: 130000,
        beløp: 10000,
        epsFribeløp: 0,
        epsInputFradrag: [],
        fradrag: [{ ...arbeidsinntekt, periode: januar }],
        ...overrides,
    });
    const lagBeregning = (fradrag: Fradrag[]): Beregning => ({
        id: 'beregning',
        opprettet: '2026-01-01T12:00:00Z',
        ...helePerioden,
        fradrag,
        begrunnelse: null,
        månedsberegninger: [lagMåned(), lagMåned({ ...februar, fradrag: [{ ...arbeidsinntekt, periode: februar }] })],
    });

    it('beholder forventet inntekt og presisjonen selv når bare arbeidsinntekt er valgt', () => {
        const måned = lagMåned();
        const grunnlag = getBeregningsgrunnlagForMåned([forventetInntekt, arbeidsinntekt], måned);

        expect(grunnlag).toEqual([forventetInntekt, arbeidsinntekt]);
        expect(grunnlag[0].beløp).toBe(10 / 12);
        expect(erFradragValgtForMåned(forventetInntekt, måned)).toBe(false);
        expect(måned.fradrag).toEqual([{ ...arbeidsinntekt, periode: januar }]);
    });

    it('kobler grunnlag til overlappende måneder, inkludert periodegrensene', () => {
        const inntektIJanuar: Fradrag = { ...forventetInntekt, periode: januar };
        const inntektIFebruar: Fradrag = { ...forventetInntekt, periode: februar };

        expect(getBeregningsgrunnlagForMåned([inntektIJanuar, inntektIFebruar], lagMåned())).toEqual([inntektIJanuar]);
        expect(getBeregningsgrunnlagForMåned([], lagMåned())).toEqual([]);
    });

    it('gjenkjenner valgt forventet inntekt fra månedsfradragene', () => {
        expect(
            erFradragValgtForMåned(forventetInntekt, lagMåned({ fradrag: [{ ...forventetInntekt, periode: januar }] })),
        ).toBe(true);
    });

    it('blander ikke søkerens og ektefellens inntekter eller ulike perioder', () => {
        expect(
            erFradragValgtForMåned(
                forventetInntekt,
                lagMåned({ fradrag: [{ ...forventetInntekt, tilhører: FradragTilhører.EPS }] }),
            ),
        ).toBe(false);
        expect(
            erFradragValgtForMåned(
                forventetInntekt,
                lagMåned({ fradrag: [{ ...forventetInntekt, periode: februar }] }),
            ),
        ).toBe(false);
    });

    it('bruker ektefellens valgte inntekter før fribeløpet, ikke det samlede ektefellefradraget', () => {
        const ektefellesInntekt: Fradrag = { ...forventetInntekt, tilhører: FradragTilhører.EPS };
        const måned = lagMåned({ epsInputFradrag: [ektefellesInntekt] });

        expect(erFradragValgtForMåned(ektefellesInntekt, måned)).toBe(true);
        expect(erFradragValgtForMåned(forventetInntekt, måned)).toBe(false);
        expect(
            erFradragValgtForMåned(
                ektefellesInntekt,
                lagMåned({ epsInputFradrag: [{ ...ektefellesInntekt, type: arbeidsinntekt.type }] }),
            ),
        ).toBe(false);
    });

    it('slår ikke sammen like månedsresultater når forventet inntekt endres', () => {
        const beregning = lagBeregning([
            { ...forventetInntekt, periode: januar },
            { ...forventetInntekt, periode: februar, beløp: 20 / 12 },
            arbeidsinntekt,
        ]);

        expect(grupperMånedsberegningerMedGrunnlag(beregning)).toEqual([
            [beregning.månedsberegninger[0]],
            [beregning.månedsberegninger[1]],
        ]);
    });

    it('slår ikke sammen måneder når grunnlaget tilhører ulike personer', () => {
        const beregning = lagBeregning([
            { ...forventetInntekt, periode: januar },
            { ...forventetInntekt, periode: februar, tilhører: FradragTilhører.EPS },
        ]);

        expect(grupperMånedsberegningerMedGrunnlag(beregning)).toHaveLength(2);
    });

    it('beholder samlet visning når både grunnlag og månedsberegninger er like', () => {
        const beregning = lagBeregning([
            { ...forventetInntekt, periode: januar },
            { ...forventetInntekt, periode: februar },
            arbeidsinntekt,
        ]);

        expect(grupperMånedsberegningerMedGrunnlag(beregning)).toEqual([beregning.månedsberegninger]);
    });
});

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
