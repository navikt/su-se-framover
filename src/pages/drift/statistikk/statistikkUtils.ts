import {
    Behandlingstidsmåling,
    SakStatistikkKategori,
    SakStatistikkKohort,
    SakStatistikkPeriode,
    SakStatistikkResponse,
    Statistikkoppløsning,
    StønadStatistikkResponse,
} from '~src/types/Statistikk';

export const MILLIS_PER_DAY = 24 * 60 * 60 * 1_000;

export interface BehandlingstidPunkt {
    periode: string;
    periodeTilOgMed: string;
    medianDager: number | null;
    p90Dager: number | null;
    gjennomsnittDager: number | null;
    antall: number;
}

export interface BehandlingstidSerie {
    ytelse: string;
    punkter: BehandlingstidPunkt[];
}

export interface Periodevalg {
    fraOgMed: string;
    tilOgMed: string;
    oppløsning: Statistikkoppløsning;
}

export type Standardperiode = 'SISTE_12_UKER' | 'SISTE_12_MÅNEDER' | 'HITTIL_I_ÅR' | 'FORRIGE_ÅR' | 'EGENDEFINERT';

const isoDato = (dato: Date): string => {
    const år = dato.getFullYear();
    const måned = String(dato.getMonth() + 1).padStart(2, '0');
    const dag = String(dato.getDate()).padStart(2, '0');
    return `${år}-${måned}-${dag}`;
};

export const lagStandardperiode = (valg: Exclude<Standardperiode, 'EGENDEFINERT'>, iDag = new Date()): Periodevalg => {
    const slutt = new Date(iDag.getFullYear(), iDag.getMonth(), iDag.getDate());
    switch (valg) {
        case 'SISTE_12_UKER': {
            const mandag = new Date(slutt);
            const ukedag = mandag.getDay() || 7;
            mandag.setDate(mandag.getDate() - (ukedag - 1) - 11 * 7);
            return { fraOgMed: isoDato(mandag), tilOgMed: isoDato(slutt), oppløsning: 'UKE' };
        }
        case 'SISTE_12_MÅNEDER':
            return {
                fraOgMed: isoDato(new Date(slutt.getFullYear(), slutt.getMonth() - 11, 1)),
                tilOgMed: isoDato(slutt),
                oppløsning: 'MÅNED',
            };
        case 'HITTIL_I_ÅR':
            return {
                fraOgMed: `${slutt.getFullYear()}-01-01`,
                tilOgMed: isoDato(slutt),
                oppløsning: 'MÅNED',
            };
        case 'FORRIGE_ÅR':
            return {
                fraOgMed: `${slutt.getFullYear() - 1}-01-01`,
                tilOgMed: `${slutt.getFullYear() - 1}-12-31`,
                oppløsning: 'MÅNED',
            };
    }
};

export const millisTilDager = (value: number): number => value / MILLIS_PER_DAY;

export const beregnVektetGjennomsnitt = (punkter: BehandlingstidPunkt[]): number | null => {
    const punkterMedData = punkter.filter(
        (punkt): punkt is BehandlingstidPunkt & { gjennomsnittDager: number } =>
            punkt.gjennomsnittDager !== null && punkt.antall > 0,
    );
    const antall = summer(punkterMedData.map((punkt) => punkt.antall));
    if (antall === 0) return null;
    return summer(punkterMedData.map((punkt) => punkt.gjennomsnittDager * punkt.antall)) / antall;
};

export function lagBehandlingstidSerier(
    perioder: SakStatistikkPeriode[],
    kategori: SakStatistikkKategori,
    sakYtelse: string | null,
    måling: Behandlingstidsmåling,
): BehandlingstidSerie[] {
    const ytelser =
        sakYtelse === null
            ? [
                  ...new Set(
                      perioder.flatMap((periode) =>
                          periode.behandlingstid
                              .filter((rad) => rad.kategori === kategori && rad.måling === måling)
                              .map((rad) => rad.sakYtelse),
                      ),
                  ),
              ].sort()
            : [sakYtelse];

    return ytelser.map((ytelse) => ({
        ytelse,
        punkter: perioder.map((periode) => {
            const rad = periode.behandlingstid.find(
                (målingRad) =>
                    målingRad.kategori === kategori && målingRad.måling === måling && målingRad.sakYtelse === ytelse,
            );
            return {
                periode: periode.fraOgMed,
                periodeTilOgMed: periode.tilOgMed,
                medianDager: rad ? millisTilDager(rad.medianMillis) : null,
                p90Dager: rad ? millisTilDager(rad.nittiendePersentilMillis) : null,
                gjennomsnittDager: rad ? millisTilDager(rad.gjennomsnittMillis) : null,
                antall: rad?.antall ?? 0,
            };
        }),
    }));
}

export const filtrerPåKategoriOgYtelse = (
    data: SakStatistikkResponse,
    kategori: SakStatistikkKategori,
    ytelse: string | null,
): SakStatistikkPeriode[] =>
    data.perioder.map((periode) => ({
        ...periode,
        antall: periode.antall.filter(
            (rad) => rad.kategori === kategori && (ytelse === null || rad.sakYtelse === ytelse),
        ),
        utfall: periode.utfall.filter(
            (rad) => rad.kategori === kategori && (ytelse === null || rad.sakYtelse === ytelse),
        ),
        beholdning: periode.beholdning.filter(
            (rad) => rad.kategori === kategori && (ytelse === null || rad.sakYtelse === ytelse),
        ),
        behandlingstid: periode.behandlingstid.filter(
            (rad) => rad.kategori === kategori && (ytelse === null || rad.sakYtelse === ytelse),
        ),
        beholdningsalder: periode.beholdningsalder.filter(
            (rad) => rad.kategori === kategori && (ytelse === null || rad.sakYtelse === ytelse),
        ),
        omarbeid: periode.omarbeid.filter(
            (rad) => rad.kategori === kategori && (ytelse === null || rad.sakYtelse === ytelse),
        ),
    }));

export const harSakstatistikk = (perioder: SakStatistikkPeriode[]): boolean =>
    perioder.some(
        (periode) =>
            periode.antall.length > 0 ||
            periode.utfall.length > 0 ||
            periode.beholdning.length > 0 ||
            periode.behandlingstid.length > 0 ||
            periode.beholdningsalder.length > 0 ||
            periode.omarbeid.length > 0,
    );

export const summer = (verdier: number[]): number => verdier.reduce((sum, verdi) => sum + verdi, 0);

export const hentStønadMånedsantall = (data: StønadStatistikkResponse, måned: string): number | null => {
    const periode = data.perioder.find((element) => element.måned === måned);
    return periode?.datagrunnlag === 'TILGJENGELIG' ? summer(periode.rader.map((rad) => rad.antall)) : null;
};

export const summerKohorter = (kohorter: SakStatistikkKohort[]): SakStatistikkKohort[] => {
    const grupper = new Map<string, SakStatistikkKohort>();
    kohorter.forEach((kohort) => {
        const nøkkel = `${kohort.kategori}\u0000${kohort.sakYtelse}`;
        const eksisterende = grupper.get(nøkkel);
        if (!eksisterende) {
            grupper.set(nøkkel, { ...kohort });
            return;
        }
        grupper.set(nøkkel, {
            ...eksisterende,
            fraOgMed: eksisterende.fraOgMed < kohort.fraOgMed ? eksisterende.fraOgMed : kohort.fraOgMed,
            tilOgMed: eksisterende.tilOgMed > kohort.tilOgMed ? eksisterende.tilOgMed : kohort.tilOgMed,
            antallStartet: eksisterende.antallStartet + kohort.antallStartet,
            ferdigInnen30Dager: {
                grunnlag: eksisterende.ferdigInnen30Dager.grunnlag + kohort.ferdigInnen30Dager.grunnlag,
                ferdige: eksisterende.ferdigInnen30Dager.ferdige + kohort.ferdigInnen30Dager.ferdige,
            },
            ferdigInnen60Dager: {
                grunnlag: eksisterende.ferdigInnen60Dager.grunnlag + kohort.ferdigInnen60Dager.grunnlag,
                ferdige: eksisterende.ferdigInnen60Dager.ferdige + kohort.ferdigInnen60Dager.ferdige,
            },
            ferdigInnen90Dager: {
                grunnlag: eksisterende.ferdigInnen90Dager.grunnlag + kohort.ferdigInnen90Dager.grunnlag,
                ferdige: eksisterende.ferdigInnen90Dager.ferdige + kohort.ferdigInnen90Dager.ferdige,
            },
            åpneVedTilOgMed: eksisterende.åpneVedTilOgMed + kohort.åpneVedTilOgMed,
        });
    });
    return [...grupper.values()].sort((a, b) => a.sakYtelse.localeCompare(b.sakYtelse, 'nb-NO'));
};

export const hentYtelser = (data: SakStatistikkResponse): string[] =>
    [
        ...new Set([
            ...data.perioder.flatMap((periode) => [
                ...periode.antall.map((rad) => rad.sakYtelse),
                ...periode.utfall.map((rad) => rad.sakYtelse),
                ...periode.beholdning.map((rad) => rad.sakYtelse),
                ...periode.behandlingstid.map((rad) => rad.sakYtelse),
                ...periode.beholdningsalder.map((rad) => rad.sakYtelse),
                ...periode.omarbeid.map((rad) => rad.sakYtelse),
            ]),
            ...data.kohorter.map((kohort) => kohort.sakYtelse),
        ]),
    ].sort();

export const filtrerStønad = (
    data: StønadStatistikkResponse,
    filter: {
        stønadstype: string | null;
        vedtakstype: string | null;
        vedtaksresultat: string | null;
        stønadsklassifisering: string | null;
    },
): StønadStatistikkResponse => ({
    ...data,
    perioder: data.perioder.map((periode) => ({
        ...periode,
        rader: periode.rader.filter(
            (rad) =>
                (filter.stønadstype === null || rad.stønadstype === filter.stønadstype) &&
                (filter.vedtakstype === null || rad.vedtakstype === filter.vedtakstype) &&
                (filter.vedtaksresultat === null || rad.vedtaksresultat === filter.vedtaksresultat) &&
                (filter.stønadsklassifisering === null || rad.stønadsklassifisering === filter.stønadsklassifisering),
        ),
        bestandsendringer: periode.bestandsendringer.filter(
            (rad) => filter.stønadstype === null || rad.stønadstype === filter.stønadstype,
        ),
    })),
});
