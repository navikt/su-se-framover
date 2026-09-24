import { HistoriskMånedsbeløpsperiode, HistoriskVedtaksperiode } from '~src/types/HistoriskAlderssak';

import {
    behandlingstypeForVisning,
    bosituasjonForVisning,
    endringskodeForVisning,
    endringskoderForVisning,
    fradragskodeForVisning,
    fradragskoderForVisning,
    godkjentAvOsForVisning,
    hentFnrFraNavigasjon,
    opphørsgrunnForVisning,
    resultatForVisning,
    saksreferanseForVisning,
} from './HistoriskAlderssakUtils';

const lagPeriode = (overrides: Partial<HistoriskVedtaksperiode> = {}): HistoriskVedtaksperiode => ({
    stønadId: 'stønad-1',
    vedtakId: 'vedtak-1',
    oppdragId: 'oppdrag-1',
    opphørskodeRaw: 'AP',
    opphørsgrunn: 'ALDERSPENSJON',
    fraOgMed: '2020-01-01',
    tilOgMed: '2020-12-31',
    sakstype: 'ALDER',
    behandlingstypeRaw: 'S',
    behandlingstype: 'SØKNAD',
    resultatRaw: 'I',
    resultat: 'INNVILGET',
    bosituasjonRaw: 'EN',
    bosituasjon: 'ENSLIG',
    årligYtelsesbeløp: 120_000,
    revurderingsdato: '2020-01-02',
    registrertTidspunkt: '2020-01-02T10:15:30',
    endringskoder: ['ENDR'],
    saksreferanse: {
        kontornummer: '1234',
        saksblokk: 'A',
        saksnummer: '5678',
        behandlendeKontor: 'Nav test',
    },
    sendtTilOs: '2020-01-02T10:00:00',
    mottattFraOs: '2020-01-02T10:05:00',
    godkjentAvOs: '2020-01-02T10:10:00',
    gyldig: true,
    ...overrides,
});

const lagMånedsbeløp = (overrides: Partial<HistoriskMånedsbeløpsperiode> = {}): HistoriskMånedsbeløpsperiode => ({
    linjeId: 'linje-1',
    fraOgMed: '2020-01-01',
    tilOgMed: '2020-01-31',
    sats: 10_000,
    fradrag: 3_000,
    fradragskoder: ['ARBM', 'FTRM'],
    beløp: 7_000,
    ...overrides,
});

describe('historisk alderssak-visning', () => {
    it('leser bare et gyldig formatert fødselsnummer fra navigasjonsstate', () => {
        expect(hentFnrFraNavigasjon({ fnr: '12345678910' })).toBe('12345678910');
        expect(hentFnrFraNavigasjon({ fnr: 'ugyldig' })).toBeNull();
        expect(hentFnrFraNavigasjon({ fnr: 12345678910 })).toBeNull();
        expect(hentFnrFraNavigasjon(null)).toBeNull();
    });

    it('bruker tolkede verdier når de finnes', () => {
        const periode = lagPeriode();

        expect(behandlingstypeForVisning(periode)).toBe('Søknad');
        expect(resultatForVisning(periode)).toBe('Innvilget');
        expect(bosituasjonForVisning(periode)).toBe('Enslig');
        expect(opphørsgrunnForVisning(periode)).toBe('Alderspensjon');
    });

    it('bruker råverdier som fallback', () => {
        const periode = lagPeriode({
            behandlingstype: null,
            behandlingstypeRaw: 'UKJENT_BEHANDLING',
            resultat: null,
            resultatRaw: 'UKJENT_RESULTAT',
            bosituasjon: null,
            bosituasjonRaw: 'UKJENT_BOSITUASJON',
            opphørsgrunn: null,
            opphørskodeRaw: 'UKJENT_OPPHØRSGRUNN',
        });

        expect(behandlingstypeForVisning(periode)).toBe('UKJENT_BEHANDLING');
        expect(resultatForVisning(periode)).toBe('UKJENT_RESULTAT');
        expect(bosituasjonForVisning(periode)).toBe('UKJENT_BOSITUASJON');
        expect(opphørsgrunnForVisning(periode)).toBe('UKJENT_OPPHØRSGRUNN');
    });

    it('viser ikke registrert når nullable kodeverdier mangler', () => {
        const periode = lagPeriode({
            bosituasjon: null,
            bosituasjonRaw: null,
            opphørsgrunn: null,
            opphørskodeRaw: null,
            oppdragId: null,
            revurderingsdato: null,
            endringskoder: [],
            saksreferanse: {
                kontornummer: null,
                saksblokk: null,
                saksnummer: null,
                behandlendeKontor: null,
            },
            sendtTilOs: null,
            mottattFraOs: null,
            godkjentAvOs: null,
        });

        expect(bosituasjonForVisning(periode)).toBe('Ikke registrert');
        expect(opphørsgrunnForVisning(periode)).toBe('Ikke registrert');
        expect(periode.endringskoder).toEqual([]);
    });

    it.each([
        ['ARBE', 'Arbeidsinntekt, ektefelle'],
        ['ARBM', 'Arbeidsinntekt, stønadsmottaker'],
        ['FTRE', 'Ytelser fra folketrygden, ektefelle'],
        ['FTRM', 'Ytelser fra folketrygden, stønadsmottaker'],
        ['PENE', 'Andre norske pensjoner, ektefelle'],
        ['PENM', 'Andre norske pensjoner, stønadsmottaker'],
        ['UTLM', 'Utenlandske pensjoner, stønadsmottaker'],
    ])('oversetter fradragskode %s', (kode, forventetTekst) => {
        expect(fradragskodeForVisning(kode)).toBe(forventetTekst);
    });

    it('viser ukjente fradragskoder uendret', () => {
        expect(fradragskodeForVisning('UKJENT_KODE')).toBe('UKJENT_KODE');
    });

    it('viser flere fradragskoder og beholder ukjente koder', () => {
        const periode = lagMånedsbeløp({
            fradragskoder: ['ARBM', 'PENE', 'UKJENT_KODE'],
        });

        expect(fradragskoderForVisning(periode.fradragskoder)).toEqual([
            'Arbeidsinntekt, stønadsmottaker',
            'Andre norske pensjoner, ektefelle',
            'UKJENT_KODE',
        ]);
    });

    it('håndterer tom liste med fradragskoder', () => {
        const periode = lagMånedsbeløp({ fradragskoder: [] });

        expect(fradragskoderForVisning(periode.fradragskoder)).toEqual([]);
    });

    it('viser godkjenningskoden fra Oppdrag som tekst og beholder ukjente koder', () => {
        expect(godkjentAvOsForVisning('J')).toBe('Ja');
        expect(godkjentAvOsForVisning('N')).toBe('Nei');
        expect(godkjentAvOsForVisning('UKJENT')).toBe('UKJENT');
        expect(godkjentAvOsForVisning(null)).toBe('Ikke registrert');
    });

    it.each([
        ['AN', 'Annullert'],
        ['UA', 'Uaktuell'],
        ['F', 'Førstegangsvedtak'],
        ['O', 'Opphørt'],
        ['E', 'Endring i beregningsgrunnlaget'],
        ['G', 'G-regulering'],
        ['NY', 'Ny'],
        ['OO', 'Overført til ny løsning'],
        ['S', 'Satsendring'],
        ['IN', 'Nytt inntektsgrunnlag'],
    ])('oversetter endringskode %s', (kode, forventetTekst) => {
        expect(endringskodeForVisning(kode)).toBe(forventetTekst);
    });

    it('viser flere endringskoder og beholder ukjente koder', () => {
        expect(endringskoderForVisning(['E', 'UKJENT_KODE'])).toEqual([
            'Endring i beregningsgrunnlaget',
            'UKJENT_KODE',
        ]);
    });

    it('samler feltene i Infotrygd-saksreferansen', () => {
        expect(
            saksreferanseForVisning({
                kontornummer: 'TEST-KONTOR-1',
                saksblokk: 'A',
                saksnummer: '1001',
                behandlendeKontor: 'TEST-KONTOR-2',
            }),
        ).toBe('TEST-KONTOR-1 / A / 1001');
    });

    it('viser ikke registrert for manglende deler av saksreferansen', () => {
        expect(
            saksreferanseForVisning({
                kontornummer: null,
                saksblokk: null,
                saksnummer: null,
                behandlendeKontor: null,
            }),
        ).toBe('Ikke registrert / Ikke registrert / Ikke registrert');
    });
});
