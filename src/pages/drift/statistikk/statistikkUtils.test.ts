import { SakStatistikkResponse } from '~src/types/Statistikk';

import {
    beregnVektetGjennomsnitt,
    filtrerPåKategoriOgYtelse,
    filtrerStønad,
    hentStønadMånedsantall,
    lagBehandlingstidSerier,
    MILLIS_PER_DAY,
    millisTilDager,
    summerKohorter,
} from './statistikkUtils';

const data: SakStatistikkResponse = {
    fraOgMed: '2026-01-01',
    tilOgMed: '2026-02-28',
    oppløsning: 'MÅNED',
    metadata: {
        aggregatversjon: 1,
        maksSekvensId: 10,
        sisteHendelseTidspunkt: '2026-02-28T12:00:00Z',
        antallBehandlinger: 2,
        behandlingerMedFlereUtfall: 0,
    },
    kohorter: [],
    perioder: [
        {
            fraOgMed: '2026-01-01',
            tilOgMed: '2026-01-31',
            antall: [],
            utfall: [],
            beholdning: [{ behandlingskategori: 'SØKNAD', sakYtelse: 'UFØRE', status: 'REGISTRERT', antall: 4 }],
            behandlingstid: [
                {
                    behandlingskategori: 'SØKNAD',
                    sakYtelse: 'UFØRE',
                    måling: 'TOTAL_BEHANDLINGSTID',
                    antall: 2,
                    gjennomsnittMillis: MILLIS_PER_DAY * 3,
                    medianMillis: MILLIS_PER_DAY * 2,
                    nittiendePersentilMillis: MILLIS_PER_DAY * 5,
                },
                {
                    behandlingskategori: 'SØKNAD',
                    sakYtelse: 'ALDER',
                    måling: 'TOTAL_BEHANDLINGSTID',
                    antall: 1,
                    gjennomsnittMillis: MILLIS_PER_DAY * 6,
                    medianMillis: MILLIS_PER_DAY * 6,
                    nittiendePersentilMillis: MILLIS_PER_DAY * 6,
                },
            ],
            beholdningsalder: [],
            omarbeid: [],
            avslagsgrunner: [],
            opphørsgrunner: [],
            klageavvisningsgrunner: [],
            klagehjemler: [],
            klageomgjøringsgrunner: [],
        },
        {
            fraOgMed: '2026-02-01',
            tilOgMed: '2026-02-28',
            antall: [],
            utfall: [],
            beholdning: [{ behandlingskategori: 'SØKNAD', sakYtelse: 'UFØRE', status: 'REGISTRERT', antall: 7 }],
            behandlingstid: [],
            beholdningsalder: [],
            omarbeid: [],
            avslagsgrunner: [],
            opphørsgrunner: [],
            klageavvisningsgrunner: [],
            klagehjemler: [],
            klageomgjøringsgrunner: [],
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

    it('filtrerer utfallsfordelinger på behandlingskategori og ytelse', () => {
        const dataMedFordelinger: SakStatistikkResponse = {
            ...data,
            perioder: [
                {
                    ...data.perioder[0],
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
                        {
                            sakYtelse: 'ALDER',
                            antallAvslag: 1,
                            antallUtenBegrunnelse: 0,
                            antallMedUkjentBegrunnelse: 0,
                            grunner: [],
                        },
                    ],
                    opphørsgrunner: [
                        {
                            sakYtelse: 'UFØRE',
                            antallOpphør: 1,
                            antallUtenBegrunnelse: 0,
                            antallMedUkjentBegrunnelse: 0,
                            grunner: [],
                        },
                    ],
                },
                data.perioder[1],
            ],
        };

        const [periode] = filtrerPåKategoriOgYtelse(dataMedFordelinger, 'SØKNAD', 'UFØRE');

        expect(periode.avslagsgrunner).toEqual([
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
        ]);
        expect(periode.opphørsgrunner).toEqual([]);
    });

    it('skiller manglende stønadsdata fra en tilgjengelig måned med null saker', () => {
        const stønadsdata = {
            fraOgMed: '2026-01',
            tilOgMed: '2026-02',
            perioder: [
                {
                    måned: '2026-01',
                    datagrunnlag: 'MANGLER' as const,
                    rader: [],
                    bestandsendringerTilgjengelig: false,
                    bestandsendringer: [],
                },
                {
                    måned: '2026-02',
                    datagrunnlag: 'TILGJENGELIG' as const,
                    rader: [],
                    bestandsendringerTilgjengelig: true,
                    bestandsendringer: [],
                },
            ],
        };

        expect(hentStønadMånedsantall(stønadsdata, '2026-01')).toBeNull();
        expect(hentStønadMånedsantall(stønadsdata, '2026-02')).toBe(0);
        expect(hentStønadMånedsantall(stønadsdata, '2026-03')).toBeNull();
    });

    it('filtrerer bestandsendringer bare på stønadstype', () => {
        const filtrert = filtrerStønad(
            {
                fraOgMed: '2026-01',
                tilOgMed: '2026-01',
                perioder: [
                    {
                        måned: '2026-01',
                        datagrunnlag: 'TILGJENGELIG',
                        rader: [],
                        bestandsendringerTilgjengelig: true,
                        bestandsendringer: [
                            {
                                stønadstype: 'UFØRE',
                                nye: 1,
                                videreført: 2,
                                utgått: 3,
                                endretStønadsklassifisering: 4,
                            },
                            {
                                stønadstype: 'ALDER',
                                nye: 5,
                                videreført: 6,
                                utgått: 7,
                                endretStønadsklassifisering: 8,
                            },
                        ],
                    },
                ],
            },
            {
                stønadstype: 'UFØRE',
                vedtakstype: 'REGULERING',
                vedtaksresultat: null,
                stønadsklassifisering: null,
            },
        );

        expect(filtrert.perioder[0].bestandsendringer).toEqual([
            {
                stønadstype: 'UFØRE',
                nye: 1,
                videreført: 2,
                utgått: 3,
                endretStønadsklassifisering: 4,
            },
        ]);
    });

    it('summerer kohorttellere og grunnlag for hele perioden', () => {
        const felles = {
            behandlingskategori: 'SØKNAD' as const,
            sakYtelse: 'UFØRE',
        };
        const [summert] = summerKohorter([
            {
                ...felles,
                fraOgMed: '2026-01-01',
                tilOgMed: '2026-01-31',
                antallStartet: 10,
                ferdigInnen30Dager: { grunnlag: 10, ferdige: 8 },
                ferdigInnen60Dager: { grunnlag: 10, ferdige: 9 },
                ferdigInnen90Dager: { grunnlag: 10, ferdige: 10 },
                åpneVedTilOgMed: 0,
            },
            {
                ...felles,
                fraOgMed: '2026-02-01',
                tilOgMed: '2026-02-28',
                antallStartet: 5,
                ferdigInnen30Dager: { grunnlag: 5, ferdige: 3 },
                ferdigInnen60Dager: { grunnlag: 2, ferdige: 2 },
                ferdigInnen90Dager: { grunnlag: 0, ferdige: 0 },
                åpneVedTilOgMed: 2,
            },
        ]);

        expect(summert).toMatchObject({
            fraOgMed: '2026-01-01',
            tilOgMed: '2026-02-28',
            antallStartet: 15,
            ferdigInnen30Dager: { grunnlag: 15, ferdige: 11 },
            ferdigInnen60Dager: { grunnlag: 12, ferdige: 11 },
            ferdigInnen90Dager: { grunnlag: 10, ferdige: 10 },
            åpneVedTilOgMed: 2,
        });
    });
});
