import { SakStatistikkResponse } from '~src/types/Statistikk';

import {
    beregnVektetGjennomsnitt,
    filtrerPåKategoriOgYtelse,
    lagBehandlingstidSerier,
    MILLIS_PER_DAY,
    millisTilDager,
} from './statistikkUtils';

const data: SakStatistikkResponse = {
    fraOgMed: '2026-01-01',
    tilOgMed: '2026-02-28',
    oppløsning: 'MÅNED',
    perioder: [
        {
            fraOgMed: '2026-01-01',
            tilOgMed: '2026-01-31',
            antall: [],
            utfall: [],
            beholdning: [{ kategori: 'SØKNAD', sakYtelse: 'UFØRE', status: 'REGISTRERT', antall: 4 }],
            behandlingstid: [
                {
                    kategori: 'SØKNAD',
                    sakYtelse: 'UFØRE',
                    måling: 'TOTAL_BEHANDLINGSTID',
                    antall: 2,
                    gjennomsnittMillis: MILLIS_PER_DAY * 3,
                    medianMillis: MILLIS_PER_DAY * 2,
                    nittiendePersentilMillis: MILLIS_PER_DAY * 5,
                },
                {
                    kategori: 'SØKNAD',
                    sakYtelse: 'ALDER',
                    måling: 'TOTAL_BEHANDLINGSTID',
                    antall: 1,
                    gjennomsnittMillis: MILLIS_PER_DAY * 6,
                    medianMillis: MILLIS_PER_DAY * 6,
                    nittiendePersentilMillis: MILLIS_PER_DAY * 6,
                },
            ],
        },
        {
            fraOgMed: '2026-02-01',
            tilOgMed: '2026-02-28',
            antall: [],
            utfall: [],
            beholdning: [{ kategori: 'SØKNAD', sakYtelse: 'UFØRE', status: 'REGISTRERT', antall: 7 }],
            behandlingstid: [],
        },
    ],
};

describe('statistikkUtils', () => {
    it('konverterer millisekunder til dager', () => {
        expect(millisTilDager(MILLIS_PER_DAY * 4.5)).toBe(4.5);
    });

    it('bevarer manglende målinger som null og ikke null dager', () => {
        const [serie] = lagBehandlingstidSerier(data.perioder, 'SØKNAD', 'UFØRE', 'TOTAL_BEHANDLINGSTID');

        expect(serie.punkter[1]).toMatchObject({
            medianDager: null,
            p90Dager: null,
            gjennomsnittDager: null,
            antall: 0,
        });
    });

    it('lager én serie per ytelse i stedet for å slå sammen medianer', () => {
        const serier = lagBehandlingstidSerier(data.perioder, 'SØKNAD', null, 'TOTAL_BEHANDLINGSTID');

        expect(serier.map((serie) => serie.ytelse)).toEqual(['ALDER', 'UFØRE']);
        expect(serier.map((serie) => serie.punkter[0].medianDager)).toEqual([6, 2]);
    });

    it('beregner gjennomsnittet for perioden vektet etter antall målinger', () => {
        expect(
            beregnVektetGjennomsnitt([
                {
                    periode: '2026-01-01',
                    periodeTilOgMed: '2026-01-31',
                    medianDager: 2,
                    p90Dager: 4,
                    gjennomsnittDager: 2,
                    antall: 1,
                },
                {
                    periode: '2026-02-01',
                    periodeTilOgMed: '2026-02-28',
                    medianDager: 4,
                    p90Dager: 8,
                    gjennomsnittDager: 4,
                    antall: 3,
                },
            ]),
        ).toBe(3.5);
    });

    it('beholder beholdning som separate øyeblikksbilder per periode', () => {
        const perioder = filtrerPåKategoriOgYtelse(data, 'SØKNAD', 'UFØRE');

        expect(perioder.map((periode) => periode.beholdning[0].antall)).toEqual([4, 7]);
    });
});
