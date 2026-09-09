import { renderToStaticMarkup } from 'react-dom/server';

import { SakStatistikkResponse } from '~src/types/Statistikk';

import SakstatistikkPanel, { SakstatistikkInnhold } from './SakstatistikkPanel';

const data: SakStatistikkResponse = {
    fraOgMed: '2026-01-01',
    tilOgMed: '2026-01-31',
    oppløsning: 'MÅNED',
    perioder: [
        {
            fraOgMed: '2026-01-01',
            tilOgMed: '2026-01-31',
            antall: [
                {
                    kategori: 'SØKNAD',
                    sakYtelse: 'UFØRE',
                    behandlingAarsak: null,
                    antall: 3,
                },
            ],
            utfall: [],
            beholdning: [],
            behandlingstid: [
                {
                    kategori: 'SØKNAD',
                    sakYtelse: 'UFØRE',
                    måling: 'TOTAL_BEHANDLINGSTID',
                    antall: 3,
                    gjennomsnittMillis: 300_000_000,
                    medianMillis: 250_000_000,
                    nittiendePersentilMillis: 500_000_000,
                },
            ],
        },
    ],
};

describe('SakstatistikkPanel', () => {
    it('har synlige etiketter, tastaturbetjente filtre og aria-live', () => {
        const markup = renderToStaticMarkup(<SakstatistikkPanel />);

        expect(markup).toContain('Periode');
        expect(markup).toContain('Behandlingskategori');
        expect(markup).toContain('<select');
        expect(markup).toContain('aria-live="polite"');
    });

    it('viser tomtilstand når periodene ikke har data', () => {
        const markup = renderToStaticMarkup(
            <SakstatistikkInnhold
                data={{ ...data, perioder: [{ ...data.perioder[0], antall: [], behandlingstid: [] }] }}
                kategori="SØKNAD"
                ytelse={null}
            />,
        );

        expect(markup).toContain('Ingen statistikk for valgt periode');
        expect(markup).not.toContain('<svg');
    });

    it('viser statistikkdata i tilgjengelige tabeller', () => {
        const markup = renderToStaticMarkup(<SakstatistikkInnhold data={data} kategori="SØKNAD" ytelse="UFØRE" />);

        expect(markup).toContain('<table');
        expect(markup).toContain('Gjennomsnittlig behandlingstid per overgang');
    });
});
