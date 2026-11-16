import {
    eqMånedsberegningBortsettFraPeriode,
    ForventetInntektSammenligning,
    Månedsberegning,
    sammenligningMedNoeValgtBort,
} from '~src/types/Beregning';
import { Fradrag, FradragTilhører, VelgbareFradragskategorier } from '~src/types/Fradrag';
import { Sats } from '~src/types/Sats';
import { InntektOgPensjon } from '~src/types/Søknadinnhold';

import { groupByEq } from './array/arrayUtils';
import { inntektFelter } from './BeregningUtils';

const arbeidsinntekt: Fradrag = {
    periode: { fraOgMed: '2026-06-01', tilOgMed: '2026-06-30' },
    type: VelgbareFradragskategorier.Arbeidsinntekt,
    beskrivelse: null,
    beløp: 15_000,
    utenlandskInntekt: null,
    tilhører: FradragTilhører.Bruker,
};

const sammenligning: ForventetInntektSammenligning = {
    forventetInntekt: 10 / 12,
    arbeidsinntekterEtterLoven: 15_000,
    inntekterISammenligningen: [arbeidsinntekt],
    benyttetFradrag: 'ARBEIDSINNTEKTER',
};

describe('sammenligning med noe valgt bort', () => {
    it('gir ingen visning når sammenligningen er null', () => {
        expect(sammenligningMedNoeValgtBort(null)).toBeNull();
    });

    it('gir ingen visning når ingen arbeidsinntekter deltok', () => {
        const utenArbeidsinntekter: ForventetInntektSammenligning = {
            ...sammenligning,
            arbeidsinntekterEtterLoven: 0,
            inntekterISammenligningen: [],
            benyttetFradrag: 'FORVENTET_INNTEKT',
        };

        expect(sammenligningMedNoeValgtBort(utenArbeidsinntekter)).toBeNull();
    });

    it('gir visning når en registrert arbeidsinntekt på 0 kr deltok', () => {
        const medArbeidsinntektPåNull: ForventetInntektSammenligning = {
            ...sammenligning,
            arbeidsinntekterEtterLoven: 0,
            inntekterISammenligningen: [{ ...arbeidsinntekt, beløp: 0 }],
            benyttetFradrag: 'FORVENTET_INNTEKT',
        };

        expect(sammenligningMedNoeValgtBort(medArbeidsinntektPåNull)).toBe(medArbeidsinntektPåNull);
    });
});

describe('inntektsvalg i grupperte månedsberegninger', () => {
    const juni: Månedsberegning = {
        sats: Sats.Høy,
        beløp: 5_000,
        grunnbeløp: 130_160,
        fraOgMed: '2026-06-01',
        tilOgMed: '2026-06-30',
        fradrag: [arbeidsinntekt],
        satsbeløp: 20_000,
        epsFribeløp: 0,
        epsInputFradrag: [],
        forventetInntektSammenligning: sammenligning,
    };
    const juli: Månedsberegning = {
        ...juni,
        fraOgMed: '2026-07-01',
        tilOgMed: '2026-07-31',
    };
    const grupper = groupByEq(eqMånedsberegningBortsettFraPeriode);

    it('slår sammen like måneder selv om inntektenes perioder er forskjellige', () => {
        const juliPeriode = { fraOgMed: juli.fraOgMed, tilOgMed: juli.tilOgMed };
        const juliMedNyPeriode: Månedsberegning = {
            ...juli,
            fradrag: [{ ...arbeidsinntekt, periode: juliPeriode }],
            forventetInntektSammenligning: {
                ...sammenligning,
                inntekterISammenligningen: [{ ...arbeidsinntekt, periode: juliPeriode }],
            },
        };

        expect(grupper([juni, juliMedNyPeriode])).toEqual([[juni, juliMedNyPeriode]]);
    });

    it.each<Partial<ForventetInntektSammenligning>>([
        { forventetInntekt: 11 / 12 },
        { arbeidsinntekterEtterLoven: 15_000.83 },
        { inntekterISammenligningen: [{ ...arbeidsinntekt, beløp: 14_000 }] },
        { benyttetFradrag: 'FORVENTET_INNTEKT' },
    ])('holder måneder atskilt når inntektssammenligningen endres: %o', (endring) => {
        const endretJuli: Månedsberegning = {
            ...juli,
            forventetInntektSammenligning: { ...sammenligning, ...endring },
        };

        expect(grupper([juni, endretJuli])).toEqual([[juni], [endretJuli]]);
    });

    it('skiller mellom null og en sammenligning, men grupperer måneder som begge har null', () => {
        const juniUtenSammenligning: Månedsberegning = { ...juni, forventetInntektSammenligning: null };
        const juliUtenSammenligning: Månedsberegning = { ...juli, forventetInntektSammenligning: null };

        expect(grupper([juniUtenSammenligning, juli])).toEqual([[juniUtenSammenligning], [juli]]);
        expect(grupper([juniUtenSammenligning, juliUtenSammenligning])).toEqual([
            [juniUtenSammenligning, juliUtenSammenligning],
        ]);
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
