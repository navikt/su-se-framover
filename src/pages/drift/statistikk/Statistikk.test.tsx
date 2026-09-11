import { renderToStaticMarkup } from 'react-dom/server';

import { SakStatistikkResponse } from '~src/types/Statistikk';

import SakstatistikkPanel, { SakstatistikkInnhold } from './SakstatistikkPanel';

const data: SakStatistikkResponse = {
    fraOgMed: '2026-01-01',
    tilOgMed: '2026-01-31',
    oppløsning: 'MÅNED',
    metadata: {
        maksSekvensId: 10,
        sisteHendelseTidspunkt: '2026-01-31T12:00:00Z',
        antallBehandlinger: 3,
        behandlingerMedFlereUtfall: 0,
    },
    kohorter: [
        {
            fraOgMed: '2026-01-01',
            tilOgMed: '2026-01-31',
            behandlingskategori: 'SØKNAD',
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
                    behandlingskategori: 'SØKNAD',
                    sakYtelse: 'UFØRE',
                    behandlingAarsak: null,
                    antall: 3,
                },
            ],
            utfall: [
                {
                    behandlingskategori: 'SØKNAD',
                    sakYtelse: 'UFØRE',
                    status: 'AVSLUTTET',
                    resultat: 'BORTFALT',
                    antall: 1,
                },
                {
                    behandlingskategori: 'SØKNAD',
                    sakYtelse: 'UFØRE',
                    status: 'AVSLUTTET',
                    resultat: null,
                    antall: 1,
                },
            ],
            beholdning: [],
            behandlingstid: [
                {
                    behandlingskategori: 'SØKNAD',
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
                    behandlingskategori: 'SØKNAD',
                    sakYtelse: 'UFØRE',
                    status: 'REGISTRERT',
                    måling: 'BEHANDLINGENS_ALDER',
                    intervall: 'DAGER_0_7',
                    antall: 1,
                },
            ],
            omarbeid: [
                {
                    behandlingskategori: 'SØKNAD',
                    sakYtelse: 'UFØRE',
                    behandlingerMedUtfall: 3,
                    utenUnderkjenning: 2,
                    medEnUnderkjenning: 1,
                    medFlereUnderkjenninger: 0,
                    medianTidEtterUnderkjenningMillis: 86_400_000,
                },
            ],
            avslagsgrunner: [
                {
                    sakYtelse: 'UFØRE',
                    antallAvslag: 2,
                    antallUtenBegrunnelse: 0,
                    antallMedUkjentBegrunnelse: 0,
                    grunner: [
                        {
                            kode: 'FORMUE',
                            paragrafer: [{ lov: 'SU', paragraf: 8 }],
                            antallBehandlinger: 2,
                        },
                    ],
                },
            ],
            opphørsgrunner: [],
            klageavvisningsgrunner: [],
            klagehjemler: [],
            klageomgjøringsgrunner: [],
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
                data={{
                    ...data,
                    kohorter: [],
                    perioder: [
                        {
                            ...data.perioder[0],
                            antall: [],
                            utfall: [],
                            beholdning: [],
                            behandlingstid: [],
                            beholdningsalder: [],
                            omarbeid: [],
                            avslagsgrunner: [],
                        },
                    ],
                }}
                kategori="SØKNAD"
                ytelse={null}
            />,
        );
        expect(markup).toContain('Ingen statistikk for valgt periode');
        expect(markup).toContain('Ingen statistikk for valgt periode');
    });

    it('lager ikke periodetabell for en seksjon uten data', () => {
        const markup = renderToStaticMarkup(
            <SakstatistikkInnhold
                data={{
                    ...data,
                    perioder: [
                        data.perioder[0],
                        {
                            ...data.perioder[0],
                            fraOgMed: '2026-02-01',
                            tilOgMed: '2026-02-28',
                        },
                    ],
                }}
                kategori="SØKNAD"
                ytelse={null}
            />,
        );

        expect(markup).toContain('Ingen data i den valgte perioden');
        expect(markup).not.toContain('Perioder for beholdning');
    });

    it('viser statistikkdata i tilgjengelige tabeller', () => {
        const markup = renderToStaticMarkup(<SakstatistikkInnhold data={data} kategori="SØKNAD" ytelse="UFØRE" />);

        expect(markup).toContain('<table');
        expect(markup).toContain('Gjennomsnittlig behandlingstid');
        expect(markup).toContain('Siste registrerte hendelse i datagrunnlaget');
        expect(markup).toContain('Liggetid for behandlinger i restanse');
        expect(markup).toContain('AVSLUTTET / BORTFALT');
        expect(markup).toContain('AVSLUTTET / MANGLER RESULTAT');
        expect(markup).toContain('Saksbehandling før attestering');
        expect(markup).toContain('Hver periode er et historisk øyeblikksbilde');
        expect(markup).toContain('Omarbeid etter underkjenning');
        expect(markup).toContain('Underkjenningsandel');
        expect(markup).toContain('Behandlinger fulgt fra mottak');
        expect(markup).toContain('Fortsatt åpne blant behandlingene som ble mottatt i perioden');
        expect(markup).toContain('Avslagsgrunner for søknader');
        expect(markup).toContain('Formuen er for høy');
        expect(markup).toContain('SU-loven § 8');
        expect(markup).toContain('Om datagrunnlaget');
    });
});
