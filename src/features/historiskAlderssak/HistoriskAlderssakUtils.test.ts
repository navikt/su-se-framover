import { HistoriskVedtaksperiode } from '~src/types/HistoriskAlderssak';

import {
    behandlingstypeForVisning,
    bosituasjonForVisning,
    hentFnrFraNavigasjon,
    resultatForVisning,
    sorterHistoriskeVedtaksperioder,
} from './HistoriskAlderssakUtils';

const lagPeriode = (overrides: Partial<HistoriskVedtaksperiode> = {}): HistoriskVedtaksperiode => ({
    stønadId: 'stønad-1',
    vedtakId: 'vedtak-1',
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
    registrertTidspunkt: '2020-01-02T10:15:30',
    gyldig: true,
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
    });

    it('bruker råverdier som fallback', () => {
        const periode = lagPeriode({
            behandlingstype: null,
            behandlingstypeRaw: 'UKJENT_BEHANDLING',
            resultat: null,
            resultatRaw: 'UKJENT_RESULTAT',
            bosituasjon: null,
            bosituasjonRaw: 'UKJENT_BOSITUASJON',
        });

        expect(behandlingstypeForVisning(periode)).toBe('UKJENT_BEHANDLING');
        expect(resultatForVisning(periode)).toBe('UKJENT_RESULTAT');
        expect(bosituasjonForVisning(periode)).toBe('UKJENT_BOSITUASJON');
    });

    it('sorterer kronologisk uten å endre input og legger perioder uten dato sist', () => {
        const utenDato = lagPeriode({ vedtakId: 'uten-dato', fraOgMed: null, registrertTidspunkt: null });
        const ny = lagPeriode({ vedtakId: 'ny', fraOgMed: '2022-01-01' });
        const gammel = lagPeriode({ vedtakId: 'gammel', fraOgMed: '2019-01-01' });
        const perioder = [utenDato, ny, gammel];

        expect(sorterHistoriskeVedtaksperioder(perioder).map((periode) => periode.vedtakId)).toEqual([
            'gammel',
            'ny',
            'uten-dato',
        ]);
        expect(perioder).toEqual([utenDato, ny, gammel]);
    });
});
