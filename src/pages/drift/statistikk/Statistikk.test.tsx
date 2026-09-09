import { renderToStaticMarkup } from 'react-dom/server';

import { SakStatistikkResponse } from '~src/types/Statistikk';

import SakstatistikkPanel, { SakstatistikkInnhold } from './SakstatistikkPanel';

const data: SakStatistikkResponse = {
    fraOgMed: '2026-01-01',
    tilOgMed: '2026-01-31',
    oppløsning: 'MÅNED',
    metadata: {
        aggregatversjon: 1,
        maksSekvensId: 10,
        sisteHendelseTidspunkt: '2026-01-31T12:00:00Z',
        antallBehandlinger: 3,
        behandlingerMedFlereUtfall: 0,
    },
    kohorter: [
        {
            fraOgMed: '2026-01-01',
            tilOgMed: '2026-01-31',
            kategori: 'SØKNAD',
            sakYtelse: 'UFØRE',
            antallStartet: 3,
            ferdigInnen30Dager: { grunnlag: 3, ferdige: 2 },
            ferdigInnen60Dager: { grunnlag: 0, ferdige: 0 },
            ferdigInnen90Dager: { grunnlag: 0, ferdige: 0 },
            åpneVedTilOgMed: 1,
        },
    ],
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
            beholdningsalder: [
                {
                    kategori: 'SØKNAD',
                    sakYtelse: 'UFØRE',
                    status: 'REGISTRERT',
                    måling: 'BEHANDLINGENS_ALDER',
                    intervall: 'DAGER_0_7',
                    antall: 1,
                },
            ],
            omarbeid: [
                {
                    kategori: 'SØKNAD',
                    sakYtelse: 'UFØRE',
                    behandlingerMedUtfall: 3,
                    utenUnderkjenning: 2,
                    medEnUnderkjenning: 1,
                    medFlereUnderkjenninger: 0,
                    medianTidEtterUnderkjenningMillis: 86_400_000,
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
        expect(markup).toContain('Gjennomsnittlig behandlingstid');
        expect(markup).toContain('Alder på beholdningen');
        expect(markup).toContain('Hver periode er et historisk øyeblikksbilde');
        expect(markup).toContain('Omarbeid etter underkjenning');
        expect(markup).toContain('Behandlinger fulgt fra mottak');
        expect(markup).toContain('Fortsatt åpne blant behandlingene som ble mottatt i perioden');
        expect(markup).toContain('Om datagrunnlaget');
    });
});
