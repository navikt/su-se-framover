import * as RemoteData from '@devexperts/remote-data-ts';
import {
    Alert,
    BodyShort,
    Box,
    Button,
    ExpansionCard,
    Heading,
    HelpText,
    HGrid,
    Label,
    Select,
    Table,
    VStack,
} from '@navikt/ds-react';
import { useMemo, useState } from 'react';

import { DatePicker } from '~src/components/inputs/datePicker/DatePicker';
import {
    Behandlingstidsmåling,
    Beholdningsaldersintervall,
    Beholdningsaldersmåling,
    SakStatistikkKategori,
    SakStatistikkKohort,
    SakStatistikkOmarbeid,
    SakStatistikkPeriode,
    SakStatistikkResponse,
    Statistikkoppløsning,
} from '~src/types/Statistikk';
import {
    formatDate,
    formatDateTime,
    parseNonNullableIsoDateOnly,
    toIsoDateOnlyString,
} from '~src/utils/date/dateUtils';

import styles from './statistikk.module.less';
import {
    BehandlingstidPunkt,
    BehandlingstidSerie,
    beregnVektetGjennomsnitt,
    filtrerPåKategoriOgYtelse,
    harSakstatistikk,
    hentYtelser,
    lagBehandlingstidSerier,
    lagStandardperiode,
    MILLIS_PER_DAY,
    Standardperiode,
    summer,
    summerKohorter,
} from './statistikkUtils';
import { useSakstatistikk } from './useStatistikk';

const kategorier: SakStatistikkKategori[] = ['SØKNAD', 'REVURDERING', 'KLAGE', 'STANS', 'GJENOPPTAK', 'TILBAKEKREVING'];

const målinger: Behandlingstidsmåling[] = [
    'TOTAL_BEHANDLINGSTID',
    'SAKSBEHANDLING_FØR_ATTESTERING',
    'TID_HOS_ATTESTANT',
    'TID_ETTER_UNDERKJENNING',
];

const målingstekst = (måling: Behandlingstidsmåling, kategori: SakStatistikkKategori): string => {
    if (måling === 'TOTAL_BEHANDLINGSTID') {
        return kategori === 'KLAGE' ? 'Klagebehandling hos oss' : 'Total behandlingstid';
    }
    if (måling === 'TID_HOS_ATTESTANT') return 'Tid hos attestant';
    if (måling === 'SAKSBEHANDLING_FØR_ATTESTERING') return 'Registrert → til attestering';
    return 'Underkjent → til attestering på nytt';
};

const målingsforklaring = (måling: Behandlingstidsmåling, kategori: SakStatistikkKategori): string => {
    if (måling === 'TOTAL_BEHANDLINGSTID') {
        return kategori === 'KLAGE'
            ? 'Tiden fra klagen ble mottatt til den først ble iverksatt, avsluttet, avbrutt eller oversendt fra førsteinstansen.'
            : 'Tiden fra behandlingen ble mottatt til den først ble iverksatt, avsluttet eller avbrutt.';
    }
    if (måling === 'SAKSBEHANDLING_FØR_ATTESTERING') {
        return 'Tiden fra behandlingen ble registrert til den ble sendt til attestering.';
    }
    if (måling === 'TID_HOS_ATTESTANT') {
        return 'Tiden fra behandlingen ble sendt til attestering til den ble iverksatt eller underkjent.';
    }
    return 'Tiden fra underkjenning til behandlingen ble sendt til attestering på nytt.';
};

const egendefinertKodetekst: Record<string, string> = {
    OMGJORING_ETTER_AVSLAG: 'Ny behandling av tidligere avslag',
    OMGJORING_ETTER_AVVIST: 'Ny behandling av tidligere avslag',
    SUALDER: 'Alder',
    SUUFORE: 'Uføre',
    SU_ALDER: 'Alder',
    SU_UFØR: 'Uføre',
};

const tekstFraKode = (verdi: string): string => {
    if (egendefinertKodetekst[verdi]) return egendefinertKodetekst[verdi];

    const småBokstaver = verdi.replaceAll('_', ' ').toLocaleLowerCase('nb-NO');
    return småBokstaver.charAt(0).toLocaleUpperCase('nb-NO') + småBokstaver.slice(1);
};

const formaterDager = (dager: number): string =>
    new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(dager);

const formaterPeriode = (fraOgMed: string, tilOgMed: string): string =>
    `${formatDate(parseNonNullableIsoDateOnly(fraOgMed))}–${formatDate(parseNonNullableIsoDateOnly(tilOgMed))}`;

const forskyvÅr = (dato: string, antall: number): Date => {
    const resultat = parseNonNullableIsoDateOnly(dato);
    resultat.setFullYear(resultat.getFullYear() + antall);
    return resultat;
};

const apiFeilmelding = (statuskode: number, melding: string): string => {
    if (statuskode === 400) return 'Kontroller valgt periode.';
    if (statuskode === 401 || statuskode === 403) return 'Du har ikke tilgang til statistikken.';
    return melding || 'Statistikken kunne ikke hentes.';
};

const SakstatistikkPanel = () => {
    const standard = lagStandardperiode('HITTIL_I_ÅR');
    const [periodevalg, setPeriodevalg] = useState<Standardperiode>('HITTIL_I_ÅR');
    const [fraOgMed, setFraOgMed] = useState(standard.fraOgMed);
    const [tilOgMed, setTilOgMed] = useState(standard.tilOgMed);
    const [oppløsning, setOppløsning] = useState<Statistikkoppløsning>(standard.oppløsning);
    const [kategori, setKategori] = useState<SakStatistikkKategori>('SØKNAD');
    const [ytelse, setYtelse] = useState<string | null>(null);
    const { status, genererer, prøvIgjen } = useSakstatistikk({ fraOgMed, tilOgMed, oppløsning });

    const velgPeriode = (valg: Standardperiode) => {
        setPeriodevalg(valg);
        if (valg === 'EGENDEFINERT') return;
        const periode = lagStandardperiode(valg);
        setFraOgMed(periode.fraOgMed);
        setTilOgMed(periode.tilOgMed);
        setOppløsning(periode.oppløsning);
    };

    const ytelser = RemoteData.isSuccess(status) ? hentYtelser(status.value) : [];

    return (
        <VStack gap={{ xs: '6', md: '8' }} className={styles.panel}>
            <HGrid columns={{ xs: 1, sm: 2, lg: 3 }} gap={{ xs: '4', md: '6' }} as="form" className={styles.filterGrid}>
                <Select
                    label="Periode"
                    value={periodevalg}
                    onChange={(event) => velgPeriode(event.target.value as Standardperiode)}
                >
                    <option value="SISTE_12_UKER">Siste 12 uker</option>
                    <option value="SISTE_12_MÅNEDER">Siste 12 måneder</option>
                    <option value="HITTIL_I_ÅR">Hittil i år</option>
                    <option value="FORRIGE_ÅR">Forrige år</option>
                    <option value="EGENDEFINERT">Egendefinert</option>
                </Select>
                <DatePicker
                    label="Fra og med"
                    value={parseNonNullableIsoDateOnly(fraOgMed)}
                    fromDate={forskyvÅr(tilOgMed, -2)}
                    toDate={parseNonNullableIsoDateOnly(tilOgMed)}
                    onChange={(dato) => {
                        if (dato) {
                            setPeriodevalg('EGENDEFINERT');
                            setFraOgMed(toIsoDateOnlyString(dato));
                        }
                    }}
                />
                <DatePicker
                    label="Til og med"
                    value={parseNonNullableIsoDateOnly(tilOgMed)}
                    fromDate={parseNonNullableIsoDateOnly(fraOgMed)}
                    toDate={forskyvÅr(fraOgMed, 2)}
                    onChange={(dato) => {
                        if (dato) {
                            setPeriodevalg('EGENDEFINERT');
                            setTilOgMed(toIsoDateOnlyString(dato));
                        }
                    }}
                />
                {periodevalg === 'EGENDEFINERT' && (
                    <Select
                        label="Oppløsning"
                        description="Velg hvordan perioden skal deles inn."
                        value={oppløsning}
                        onChange={(event) => setOppløsning(event.target.value as Statistikkoppløsning)}
                    >
                        <option value="UKE">Uke</option>
                        <option value="MÅNED">Måned</option>
                        <option value="ÅR">År</option>
                    </Select>
                )}
                <Select
                    label="Behandlingskategori"
                    value={kategori}
                    onChange={(event) => setKategori(event.target.value as SakStatistikkKategori)}
                >
                    {kategorier.map((verdi) => (
                        <option key={verdi} value={verdi}>
                            {tekstFraKode(verdi)}
                        </option>
                    ))}
                </Select>
                <Select label="Ytelse" value={ytelse ?? ''} onChange={(event) => setYtelse(event.target.value || null)}>
                    <option value="">Alle ytelser</option>
                    {ytelser.map((verdi) => (
                        <option key={verdi} value={verdi}>
                            {tekstFraKode(verdi)}
                        </option>
                    ))}
                </Select>
            </HGrid>

            <div className="sr-only" aria-live="polite">
                {genererer
                    ? 'Vi lager statistikken.'
                    : RemoteData.isSuccess(status)
                      ? `Viser ${status.value.perioder.length} perioder.`
                      : RemoteData.isFailure(status)
                        ? 'Statistikken kunne ikke hentes.'
                        : 'Henter statistikk.'}
            </div>

            {RemoteData.isPending(status) && !genererer && <Alert variant="info">Henter statistikk.</Alert>}
            {genererer && <Alert variant="info">Vi lager statistikken. Dette kan ta litt tid.</Alert>}
            {RemoteData.isFailure(status) && (
                <Alert variant="error">
                    <VStack gap="3">
                        <BodyShort>{apiFeilmelding(status.error.statusCode, status.error.body.message)}</BodyShort>
                        <div>
                            <Button size="small" variant="secondary" onClick={prøvIgjen}>
                                Prøv igjen
                            </Button>
                        </div>
                    </VStack>
                </Alert>
            )}
            {RemoteData.isSuccess(status) && (
                <SakstatistikkInnhold data={status.value} kategori={kategori} ytelse={ytelse} />
            )}
        </VStack>
    );
};

export const SakstatistikkInnhold = (props: {
    data: SakStatistikkResponse;
    kategori: SakStatistikkKategori;
    ytelse: string | null;
}) => {
    const perioder = useMemo(
        () => filtrerPåKategoriOgYtelse(props.data, props.kategori, props.ytelse),
        [props.data, props.kategori, props.ytelse],
    );
    const kohorter = props.data.kohorter.filter(
        (kohort) => kohort.kategori === props.kategori && (props.ytelse === null || kohort.sakYtelse === props.ytelse),
    );
    const harPeriodedata = harSakstatistikk(perioder);

    return (
        <VStack gap={{ xs: '6', md: '8' }}>
            {!harPeriodedata && kohorter.length === 0 ? (
                <Alert variant="info">Ingen statistikk for valgt periode.</Alert>
            ) : (
                <>
                    {harPeriodedata && (
                        <>
                            <StatistikkortGrid perioder={perioder} kategori={props.kategori} ytelse={props.ytelse} />
                            <BehandlingstidKortGrid
                                perioder={props.data.perioder}
                                kategori={props.kategori}
                                ytelse={props.ytelse}
                            />
                            <AntallDiagram perioder={perioder} kategori={props.kategori} />
                            <UtfallDiagram perioder={perioder} />
                            <BeholdningDiagram perioder={perioder} />
                            <Beholdningsalder perioder={perioder} />
                            <Omarbeid perioder={perioder} />
                        </>
                    )}
                    <Kohorter kohorter={kohorter} rapportdato={props.data.tilOgMed} />
                </>
            )}
            <Datagrunnlag data={props.data} />
        </VStack>
    );
};

const StatistikkortGrid = (props: {
    perioder: SakStatistikkPeriode[];
    kategori: SakStatistikkKategori;
    ytelse: string | null;
}) => {
    const sistePeriode = props.perioder.at(-1);

    const kort = [
        {
            tittel: 'Registrerte behandlinger i perioden',
            verdi: summer(props.perioder.flatMap((periode) => periode.antall.map((rad) => rad.antall))).toLocaleString(
                'nb-NO',
            ),
            detaljer: 'Behandlinger som ble registrert i hele den valgte perioden.',
        },
        {
            tittel: 'Statusoverganger i perioden',
            verdi: summer(props.perioder.flatMap((periode) => periode.utfall.map((rad) => rad.antall))).toLocaleString(
                'nb-NO',
            ),
            detaljer: 'Overganger til iverksatt, avsluttet, avbrutt eller oversendt i hele perioden.',
        },
        {
            tittel: 'Beholdning ved periodens slutt',
            verdi: summer(sistePeriode?.beholdning.map((rad) => rad.antall) ?? []).toLocaleString('nb-NO'),
            detaljer: 'Behandlinger som fortsatt var åpne hos vedtaksinstansen på sluttdatoen.',
        },
    ];

    return (
        <section aria-labelledby="periodetotaler">
            <VStack gap="4">
                <div>
                    <Heading id="periodetotaler" level="3" size="medium">
                        Totalt for valgt periode
                    </Heading>
                    <BodyShort>
                        {tekstFraKode(props.kategori)}, {props.ytelse ? tekstFraKode(props.ytelse) : 'alle ytelser'}
                    </BodyShort>
                </div>
                <HGrid columns={{ xs: 1, sm: 3 }} gap={{ xs: '4', md: '6' }}>
                    {kort.map((element) => (
                        <Box
                            key={element.tittel}
                            background="surface-default"
                            borderColor="border-divider"
                            borderWidth="1"
                            borderRadius="medium"
                            padding="6"
                        >
                            <VStack gap="2">
                                <Label>{element.tittel}</Label>
                                <Heading level="4" size="large">
                                    {element.verdi}
                                </Heading>
                                <BodyShort size="small">{element.detaljer}</BodyShort>
                            </VStack>
                        </Box>
                    ))}
                </HGrid>
            </VStack>
        </section>
    );
};

const BehandlingstidKortGrid = (props: {
    perioder: SakStatistikkPeriode[];
    kategori: SakStatistikkKategori;
    ytelse: string | null;
}) => {
    const relevanteMålinger =
        props.kategori === 'KLAGE' ? målinger.filter((måling) => måling === 'TOTAL_BEHANDLINGSTID') : målinger;
    const alleSerier = målinger.flatMap((måling) =>
        lagBehandlingstidSerier(props.perioder, props.kategori, props.ytelse, måling).map((serie) => ({
            ...serie,
            måling,
        })),
    );
    const ytelser = [...new Set(alleSerier.map((serie) => serie.ytelse))];

    if (ytelser.length === 0) {
        return <Alert variant="info">Ingen behandlingstider for valgt kategori og ytelse.</Alert>;
    }

    return (
        <section aria-labelledby="behandlingstid-oversikt">
            <VStack gap="4">
                <div>
                    <div className={styles.beskrivelseMedHjelp}>
                        <Heading id="behandlingstid-oversikt" level="3" size="medium">
                            Gjennomsnittlig behandlingstid
                        </Heading>
                        <HelpText title="Slik beregnes behandlingstiden">
                            <ul>
                                {relevanteMålinger.map((måling) => (
                                    <li key={måling}>
                                        <strong>{målingstekst(måling, props.kategori)}:</strong>{' '}
                                        {målingsforklaring(måling, props.kategori)}
                                    </li>
                                ))}
                            </ul>
                        </HelpText>
                    </div>
                    <BodyShort>
                        Kortene viser et antallsvektet gjennomsnitt for hele perioden. Ytelsene holdes adskilt.
                    </BodyShort>
                </div>
                {ytelser.map((seriensYtelse) => (
                    <VStack key={seriensYtelse} gap="3">
                        <Heading level="4" size="small">
                            {tekstFraKode(seriensYtelse)}
                        </Heading>
                        <HGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap={{ xs: '4', md: '6' }}>
                            {relevanteMålinger.map((måling) => {
                                const serie = alleSerier.find(
                                    (element) => element.ytelse === seriensYtelse && element.måling === måling,
                                );
                                const gjennomsnitt = serie ? beregnVektetGjennomsnitt(serie.punkter) : null;
                                const antall = serie ? summer(serie.punkter.map((punkt) => punkt.antall)) : 0;
                                return (
                                    <Box
                                        key={måling}
                                        background="surface-default"
                                        borderColor="border-divider"
                                        borderWidth="1"
                                        borderRadius="medium"
                                        padding="5"
                                    >
                                        <VStack gap="2">
                                            <Label>{målingstekst(måling, props.kategori)}</Label>
                                            <Heading level="5" size="medium">
                                                {gjennomsnitt === null
                                                    ? 'Ingen data'
                                                    : `${formaterDager(gjennomsnitt)} dager`}
                                            </Heading>
                                            <BodyShort size="small">
                                                {gjennomsnitt === null
                                                    ? 'Ingen målinger i valgt periode.'
                                                    : `${antall} ${
                                                          måling === 'TOTAL_BEHANDLINGSTID'
                                                              ? 'behandlinger'
                                                              : 'målinger'
                                                      }`}
                                            </BodyShort>
                                        </VStack>
                                    </Box>
                                );
                            })}
                        </HGrid>
                    </VStack>
                ))}
            </VStack>
        </section>
    );
};

export const BehandlingstidDiagram = (props: {
    serier: BehandlingstidSerie[];
    kategori: SakStatistikkKategori;
    måling: Behandlingstidsmåling;
    fraOgMed: string;
    tilOgMed: string;
}) => {
    const [aktivtPunkt, setAktivtPunkt] = useState<{ ytelse: string; punkt: BehandlingstidPunkt } | null>(null);
    const allePunkter = props.serier.flatMap((serie) => serie.punkter);
    const maks = Math.max(1, ...allePunkter.flatMap((punkt) => [punkt.medianDager ?? 0, punkt.p90Dager ?? 0]));
    const bredde = 900;
    const høyde = 260;
    const padding = 36;
    const antallPerioder = Math.max(allePunkter.length > 0 ? props.serier[0].punkter.length : 0, 2);
    const x = (indeks: number) => padding + (indeks * (bredde - padding * 2)) / (antallPerioder - 1);
    const y = (verdi: number) => høyde - padding - (verdi / maks) * (høyde - padding * 2);
    const farger = ['var(--a-blue-600)', 'var(--a-purple-600)', 'var(--a-orange-600)', 'var(--a-green-600)'];

    const segmenter = (punkter: BehandlingstidPunkt[], felt: 'medianDager' | 'p90Dager'): string[] => {
        const resultat: string[] = [];
        let segment = '';
        punkter.forEach((punkt, indeks) => {
            const verdi = punkt[felt];
            if (verdi === null) {
                if (segment) resultat.push(segment);
                segment = '';
            } else {
                segment += `${segment ? ' ' : ''}${x(indeks)},${y(verdi)}`;
            }
        });
        if (segment) resultat.push(segment);
        return resultat;
    };

    return (
        <section aria-labelledby="behandlingstid-tittel">
            <VStack gap="4">
                <div>
                    <Heading id="behandlingstid-tittel" level="3" size="medium">
                        {tekstFraKode(props.kategori)}: {målingstekst(props.måling, props.kategori)} fra{' '}
                        {formaterPeriode(props.fraOgMed, props.tilOgMed)}
                    </Heading>
                    <div className={styles.beskrivelseMedHjelp}>
                        <BodyShort as="span">
                            {målingsforklaring(props.måling, props.kategori)} Median vises med heltrukken linje.
                            90-persentilen vises stiplet.
                        </BodyShort>
                        <HelpText title="Hva betyr 90-persentil?">
                            90 prosent av målingene brukte denne tiden eller mindre.
                        </HelpText>
                    </div>
                </div>
                {props.serier.length === 0 ? (
                    <Alert variant="info">Ingen behandlingstider for valgt filter.</Alert>
                ) : (
                    <>
                        <div className={styles.diagramRamme}>
                            <svg
                                className={styles.linjediagram}
                                viewBox={`0 0 ${bredde} ${høyde}`}
                                role="img"
                                aria-labelledby="behandlingstid-tittel behandlingstid-beskrivelse"
                            >
                                <desc id="behandlingstid-beskrivelse">
                                    Behandlingstid i dager. Alle verdiene finnes i tabellen under diagrammet.
                                </desc>
                                <line
                                    x1={padding}
                                    y1={høyde - padding}
                                    x2={bredde - padding}
                                    y2={høyde - padding}
                                    className={styles.akse}
                                />
                                <line
                                    x1={padding}
                                    y1={padding}
                                    x2={padding}
                                    y2={høyde - padding}
                                    className={styles.akse}
                                />
                                <text x={padding} y={padding - 10} className={styles.aksetekst}>
                                    {formaterDager(maks)} dager
                                </text>
                                <text x={padding} y={høyde - 10} className={styles.aksetekst}>
                                    {allePunkter[0]?.periode}
                                </text>
                                <text x={bredde - padding} y={høyde - 10} textAnchor="end" className={styles.aksetekst}>
                                    {allePunkter.at(-1)?.periode}
                                </text>
                                {props.serier.map((serie, serieindeks) => (
                                    <g key={serie.ytelse}>
                                        {segmenter(serie.punkter, 'medianDager').map((punkter) => (
                                            <polyline
                                                key={`median-${punkter}`}
                                                points={punkter}
                                                fill="none"
                                                stroke={farger[serieindeks % farger.length]}
                                                strokeWidth="4"
                                            />
                                        ))}
                                        {segmenter(serie.punkter, 'p90Dager').map((punkter) => (
                                            <polyline
                                                key={`p90-${punkter}`}
                                                points={punkter}
                                                fill="none"
                                                stroke={farger[serieindeks % farger.length]}
                                                strokeWidth="3"
                                                strokeDasharray="10 8"
                                            />
                                        ))}
                                        {serie.punkter.map((punkt, indeks) =>
                                            punkt.medianDager === null ? null : (
                                                <circle
                                                    key={`${serie.ytelse}-${punkt.periode}`}
                                                    cx={x(indeks)}
                                                    cy={y(punkt.medianDager)}
                                                    r="7"
                                                    fill={farger[serieindeks % farger.length]}
                                                    className={styles.diagrampunkt}
                                                    tabIndex={0}
                                                    role="button"
                                                    aria-label={`${tekstFraKode(serie.ytelse)}, ${formaterPeriode(punkt.periode, punkt.periodeTilOgMed)}. Median ${formaterDager(punkt.medianDager)} dager. Vis detaljer.`}
                                                    onFocus={() => setAktivtPunkt({ ytelse: serie.ytelse, punkt })}
                                                    onMouseEnter={() => setAktivtPunkt({ ytelse: serie.ytelse, punkt })}
                                                />
                                            ),
                                        )}
                                        {serie.punkter.map((punkt, indeks) =>
                                            punkt.p90Dager === null ? null : (
                                                <rect
                                                    key={`p90-${serie.ytelse}-${punkt.periode}`}
                                                    x={x(indeks) - 6}
                                                    y={y(punkt.p90Dager) - 6}
                                                    width="12"
                                                    height="12"
                                                    fill="var(--a-surface-default)"
                                                    stroke={farger[serieindeks % farger.length]}
                                                    strokeWidth="3"
                                                    className={styles.diagrampunkt}
                                                    tabIndex={0}
                                                    role="button"
                                                    aria-label={`${tekstFraKode(serie.ytelse)}, ${formaterPeriode(punkt.periode, punkt.periodeTilOgMed)}. 90-persentil ${formaterDager(punkt.p90Dager)} dager. Vis detaljer.`}
                                                    onFocus={() => setAktivtPunkt({ ytelse: serie.ytelse, punkt })}
                                                    onMouseEnter={() => setAktivtPunkt({ ytelse: serie.ytelse, punkt })}
                                                />
                                            ),
                                        )}
                                    </g>
                                ))}
                            </svg>
                        </div>
                        <div className={styles.forklaring}>
                            {props.serier.map((serie, indeks) => (
                                <span key={serie.ytelse}>
                                    <span
                                        className={styles.fargeprøve}
                                        style={{ backgroundColor: farger[indeks % farger.length] }}
                                    />{' '}
                                    {tekstFraKode(serie.ytelse)}
                                </span>
                            ))}
                        </div>
                        <div className={styles.tooltip} aria-live="polite">
                            {aktivtPunkt ? (
                                <>
                                    <strong>
                                        {tekstFraKode(aktivtPunkt.ytelse)},{' '}
                                        {formaterPeriode(aktivtPunkt.punkt.periode, aktivtPunkt.punkt.periodeTilOgMed)}
                                    </strong>
                                    <span>Median: {formaterDager(aktivtPunkt.punkt.medianDager ?? 0)} dager</span>
                                    <span>90-persentil: {formaterDager(aktivtPunkt.punkt.p90Dager ?? 0)} dager</span>
                                    <span>
                                        Gjennomsnitt: {formaterDager(aktivtPunkt.punkt.gjennomsnittDager ?? 0)} dager
                                    </span>
                                    <span>
                                        {props.måling === 'TOTAL_BEHANDLINGSTID'
                                            ? 'Antall behandlinger'
                                            : 'Antall målinger'}
                                        : {aktivtPunkt.punkt.antall}
                                    </span>
                                </>
                            ) : (
                                <span>Velg et punkt i diagrammet for å se detaljer.</span>
                            )}
                        </div>
                    </>
                )}
                <BehandlingstidTabell serier={props.serier} måling={props.måling} />
            </VStack>
        </section>
    );
};

export const BehandlingstidTabell = (props: { serier: BehandlingstidSerie[]; måling: Behandlingstidsmåling }) => (
    <ExpansionCard aria-label="Tabell med behandlingstider">
        <ExpansionCard.Header>
            <ExpansionCard.Title as="h4" size="small">
                Vis data i tabell
            </ExpansionCard.Title>
        </ExpansionCard.Header>
        <ExpansionCard.Content>
            <div className={styles.tabellRamme}>
                <Table size="small">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Periode</Table.HeaderCell>
                            <Table.HeaderCell>Ytelse</Table.HeaderCell>
                            <Table.HeaderCell align="right">Median</Table.HeaderCell>
                            <Table.HeaderCell align="right">90-persentil</Table.HeaderCell>
                            <Table.HeaderCell align="right">Gjennomsnitt</Table.HeaderCell>
                            <Table.HeaderCell align="right">
                                {props.måling === 'TOTAL_BEHANDLINGSTID' ? 'Behandlinger' : 'Målinger'}
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {props.serier.flatMap((serie) =>
                            serie.punkter.map((punkt) => (
                                <Table.Row key={`${serie.ytelse}-${punkt.periode}`}>
                                    <Table.DataCell>
                                        {formaterPeriode(punkt.periode, punkt.periodeTilOgMed)}
                                    </Table.DataCell>
                                    <Table.DataCell>{tekstFraKode(serie.ytelse)}</Table.DataCell>
                                    <Table.DataCell align="right">
                                        {punkt.medianDager === null
                                            ? 'Ingen data'
                                            : `${formaterDager(punkt.medianDager)} dager`}
                                    </Table.DataCell>
                                    <Table.DataCell align="right">
                                        {punkt.p90Dager === null
                                            ? 'Ingen data'
                                            : `${formaterDager(punkt.p90Dager)} dager`}
                                    </Table.DataCell>
                                    <Table.DataCell align="right">
                                        {punkt.gjennomsnittDager === null
                                            ? 'Ingen data'
                                            : `${formaterDager(punkt.gjennomsnittDager)} dager`}
                                    </Table.DataCell>
                                    <Table.DataCell align="right">{punkt.antall}</Table.DataCell>
                                </Table.Row>
                            )),
                        )}
                    </Table.Body>
                </Table>
            </div>
        </ExpansionCard.Content>
    </ExpansionCard>
);

const aldersintervaller: Beholdningsaldersintervall[] = [
    'DAGER_0_7',
    'DAGER_8_30',
    'DAGER_31_60',
    'DAGER_61_90',
    'OVER_90_DAGER',
];

const aldersintervalltekst: Record<Beholdningsaldersintervall, string> = {
    DAGER_0_7: '0–7 dager',
    DAGER_8_30: '8–30 dager',
    DAGER_31_60: '31–60 dager',
    DAGER_61_90: '61–90 dager',
    OVER_90_DAGER: 'Over 90 dager',
};

const aldersmålingstekst: Record<Beholdningsaldersmåling, string> = {
    BEHANDLINGENS_ALDER: 'Behandlingens totale alder',
    TID_I_NÅVÆRENDE_STATUS: 'Tid i status ved periodens slutt',
};

const Alderstabell = ({ periode, måling }: { periode: SakStatistikkPeriode; måling: Beholdningsaldersmåling }) => {
    const rader = periode.beholdningsalder.filter((rad) => rad.måling === måling);
    if (rader.length === 0) return <BodyShort>Ingen data for denne målingen.</BodyShort>;

    const grupper = [...new Set(rader.map((rad) => `${rad.sakYtelse}\u0000${rad.status}`))].sort((a, b) =>
        a.localeCompare(b, 'nb-NO'),
    );

    return (
        <div className={styles.tabellRamme}>
            <Table size="small">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Ytelse</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        {aldersintervaller.map((intervall) => (
                            <Table.HeaderCell key={intervall} align="right">
                                {aldersintervalltekst[intervall]}
                            </Table.HeaderCell>
                        ))}
                        <Table.HeaderCell align="right">Totalt</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {grupper.map((gruppe) => {
                        const [sakYtelse, status] = gruppe.split('\u0000');
                        const antallPerIntervall = aldersintervaller.map((intervall) =>
                            summer(
                                rader
                                    .filter(
                                        (rad) =>
                                            rad.sakYtelse === sakYtelse &&
                                            rad.status === status &&
                                            rad.intervall === intervall,
                                    )
                                    .map((rad) => rad.antall),
                            ),
                        );
                        return (
                            <Table.Row key={gruppe}>
                                <Table.DataCell>{tekstFraKode(sakYtelse)}</Table.DataCell>
                                <Table.DataCell>{tekstFraKode(status)}</Table.DataCell>
                                {antallPerIntervall.map((antall, indeks) => (
                                    <Table.DataCell key={aldersintervaller[indeks]} align="right">
                                        {antall}
                                    </Table.DataCell>
                                ))}
                                <Table.DataCell align="right">{summer(antallPerIntervall)}</Table.DataCell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table>
        </div>
    );
};

const Beholdningsalder = ({ perioder }: { perioder: SakStatistikkPeriode[] }) => {
    const perioderMedData = perioder.filter((periode) => periode.beholdningsalder.length > 0);
    const sistePeriode = perioderMedData.at(-1);
    if (!sistePeriode) return null;

    return (
        <section aria-labelledby="beholdningsalder-tittel">
            <VStack gap="4">
                <div>
                    <Heading id="beholdningsalder-tittel" level="3" size="medium">
                        Alder på beholdningen
                    </Heading>
                    <BodyShort>
                        Behandlingens totale alder regnes fra mottatt tidspunkt til periodens slutt. Tid i status ved
                        periodens slutt regnes fra siste statusovergang til den samme sluttdatoen. «Registrert» i over
                        90 dager betyr derfor at ingen senere statusovergang er registrert, ikke nødvendigvis at ingen
                        har arbeidet med behandlingen. Første tabell viser beholdningen ved slutten av siste delperiode.
                        Periodene summeres ikke.
                    </BodyShort>
                </div>
                <Alert variant="info">
                    <VStack gap="2">
                        <Label>Slik leser du tabellene</Label>
                        <BodyShort>
                            Hver periode er et historisk øyeblikksbilde ved periodens slutt. En behandling som ble
                            mottatt 1. januar, og fikk en ny status 10. februar, kan ha 30 dagers total alder og 30
                            dager i «Registrert» 31. januar. Den 28. februar kan den ha 58 dagers total alder og 18
                            dager i den nye statusen. Når behandlingen får en avsluttende status, inngår den ikke i
                            senere beholdningsbilder. Sammenligning av periodene viser hvordan aldersfordelingen i den
                            åpne beholdningen utvikler seg. Den følger ikke hver enkelt behandling; det gjør
                            kohortvisningen.
                        </BodyShort>
                    </VStack>
                </Alert>
                <Heading level="4" size="small">
                    {formaterPeriode(sistePeriode.fraOgMed, sistePeriode.tilOgMed)}
                </Heading>
                {(Object.keys(aldersmålingstekst) as Beholdningsaldersmåling[]).map((måling) => (
                    <VStack key={måling} gap="3">
                        <Heading level="5" size="xsmall">
                            {aldersmålingstekst[måling]}
                        </Heading>
                        <Alderstabell periode={sistePeriode} måling={måling} />
                    </VStack>
                ))}
                {perioderMedData.length > 1 && (
                    <ExpansionCard aria-label="Beholdningsalder for tidligere perioder">
                        <ExpansionCard.Header>
                            <ExpansionCard.Title as="h4" size="small">
                                Vis tidligere perioder
                            </ExpansionCard.Title>
                        </ExpansionCard.Header>
                        <ExpansionCard.Content>
                            <VStack gap="6">
                                {[...perioderMedData]
                                    .reverse()
                                    .slice(1)
                                    .map((periode) => (
                                        <VStack key={periode.fraOgMed} gap="4">
                                            <Heading level="5" size="small">
                                                {formaterPeriode(periode.fraOgMed, periode.tilOgMed)}
                                            </Heading>
                                            {(Object.keys(aldersmålingstekst) as Beholdningsaldersmåling[]).map(
                                                (måling) => (
                                                    <VStack key={måling} gap="3">
                                                        <Heading level="6" size="xsmall">
                                                            {aldersmålingstekst[måling]}
                                                        </Heading>
                                                        <Alderstabell periode={periode} måling={måling} />
                                                    </VStack>
                                                ),
                                            )}
                                        </VStack>
                                    ))}
                            </VStack>
                        </ExpansionCard.Content>
                    </ExpansionCard>
                )}
            </VStack>
        </section>
    );
};

const Omarbeidskort = ({ rad }: { rad: SakStatistikkOmarbeid }) => (
    <VStack gap="3">
        <div>
            <Heading level="4" size="small">
                {tekstFraKode(rad.sakYtelse)}
            </Heading>
            <BodyShort size="small">{rad.behandlingerMedUtfall} behandlinger med utfall</BodyShort>
        </div>
        <HGrid columns={{ xs: 2, lg: 4 }} gap="4">
            <Oppsummeringsboks tittel="Uten underkjenning" verdi={rad.utenUnderkjenning.toLocaleString('nb-NO')} />
            <Oppsummeringsboks tittel="Én underkjenning" verdi={rad.medEnUnderkjenning.toLocaleString('nb-NO')} />
            <Oppsummeringsboks
                tittel="Flere underkjenninger"
                verdi={rad.medFlereUnderkjenninger.toLocaleString('nb-NO')}
            />
            <Oppsummeringsboks
                tittel="Median tid etter underkjenning"
                verdi={
                    rad.medianTidEtterUnderkjenningMillis === null
                        ? 'Ingen måling'
                        : `${formaterDager(rad.medianTidEtterUnderkjenningMillis / MILLIS_PER_DAY)} dager`
                }
            />
        </HGrid>
    </VStack>
);

const Oppsummeringsboks = ({ tittel, verdi }: { tittel: string; verdi: string }) => (
    <Box background="surface-default" borderColor="border-divider" borderWidth="1" borderRadius="medium" padding="5">
        <VStack gap="2">
            <Label>{tittel}</Label>
            <Heading level="5" size="medium">
                {verdi}
            </Heading>
        </VStack>
    </Box>
);

const Omarbeid = ({ perioder }: { perioder: SakStatistikkPeriode[] }) => {
    const perioderMedData = perioder.filter((periode) => periode.omarbeid.length > 0);
    const sistePeriode = perioderMedData.at(-1);
    if (!sistePeriode) return null;

    return (
        <section aria-labelledby="omarbeid-tittel">
            <VStack gap="4">
                <div>
                    <Heading id="omarbeid-tittel" level="3" size="medium">
                        Omarbeid etter underkjenning
                    </Heading>
                    <BodyShort>
                        Behandlinger som ble ferdige i perioden, fordelt etter om de ble underkjent null, én eller flere
                        ganger. Medianen er samlet tid fra underkjenning til ny attestering per behandling.
                    </BodyShort>
                </div>
                <Heading level="4" size="small">
                    {formaterPeriode(sistePeriode.fraOgMed, sistePeriode.tilOgMed)}
                </Heading>
                {sistePeriode.omarbeid.map((rad) => (
                    <Omarbeidskort key={rad.sakYtelse} rad={rad} />
                ))}
                {perioderMedData.length > 1 && (
                    <ExpansionCard aria-label="Omarbeid for tidligere perioder">
                        <ExpansionCard.Header>
                            <ExpansionCard.Title as="h4" size="small">
                                Vis tidligere perioder
                            </ExpansionCard.Title>
                            <ExpansionCard.Description>
                                Medianene gjelder hver enkelt periode og summeres ikke.
                            </ExpansionCard.Description>
                        </ExpansionCard.Header>
                        <ExpansionCard.Content>
                            <div className={styles.tabellRamme}>
                                <Table size="small">
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>Periode</Table.HeaderCell>
                                            <Table.HeaderCell>Ytelse</Table.HeaderCell>
                                            <Table.HeaderCell align="right">Med utfall</Table.HeaderCell>
                                            <Table.HeaderCell align="right">Uten underkjenning</Table.HeaderCell>
                                            <Table.HeaderCell align="right">Én</Table.HeaderCell>
                                            <Table.HeaderCell align="right">Flere</Table.HeaderCell>
                                            <Table.HeaderCell align="right">
                                                Median etter underkjenning
                                            </Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {[...perioderMedData].reverse().flatMap((periode) =>
                                            periode.omarbeid.map((rad) => (
                                                <Table.Row key={`${periode.fraOgMed}-${rad.sakYtelse}`}>
                                                    <Table.DataCell>
                                                        {formaterPeriode(periode.fraOgMed, periode.tilOgMed)}
                                                    </Table.DataCell>
                                                    <Table.DataCell>{tekstFraKode(rad.sakYtelse)}</Table.DataCell>
                                                    <Table.DataCell align="right">
                                                        {rad.behandlingerMedUtfall}
                                                    </Table.DataCell>
                                                    <Table.DataCell align="right">
                                                        {rad.utenUnderkjenning}
                                                    </Table.DataCell>
                                                    <Table.DataCell align="right">
                                                        {rad.medEnUnderkjenning}
                                                    </Table.DataCell>
                                                    <Table.DataCell align="right">
                                                        {rad.medFlereUnderkjenninger}
                                                    </Table.DataCell>
                                                    <Table.DataCell align="right">
                                                        {rad.medianTidEtterUnderkjenningMillis === null
                                                            ? 'Ingen måling'
                                                            : `${formaterDager(
                                                                  rad.medianTidEtterUnderkjenningMillis /
                                                                      MILLIS_PER_DAY,
                                                              )} dager`}
                                                    </Table.DataCell>
                                                </Table.Row>
                                            )),
                                        )}
                                    </Table.Body>
                                </Table>
                            </div>
                        </ExpansionCard.Content>
                    </ExpansionCard>
                )}
            </VStack>
        </section>
    );
};

const fristtekst = (kohort: SakStatistikkKohort, dager: 30 | 60 | 90): string => {
    const frist = kohort[`ferdigInnen${dager}Dager`];
    if (frist.grunnlag === 0) return 'Ikke nok oppfølgingstid';
    const prosent = (frist.ferdige / frist.grunnlag) * 100;
    const dekning =
        frist.grunnlag < kohort.antallStartet ? `, ${frist.grunnlag} av ${kohort.antallStartet} kan vurderes` : '';
    return `${frist.ferdige} av ${frist.grunnlag} (${prosent.toFixed(1)} %)${dekning}`;
};

const Kohorttabell = ({ kohorter, rapportdato }: { kohorter: SakStatistikkKohort[]; rapportdato: string }) => (
    <div className={styles.tabellRamme}>
        <Table size="small">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Mottaksperiode</Table.HeaderCell>
                    <Table.HeaderCell>Ytelse</Table.HeaderCell>
                    <Table.HeaderCell align="right">Mottatt</Table.HeaderCell>
                    <Table.HeaderCell>Ferdige innen 30 dager</Table.HeaderCell>
                    <Table.HeaderCell>Ferdige innen 60 dager</Table.HeaderCell>
                    <Table.HeaderCell>Ferdige innen 90 dager</Table.HeaderCell>
                    <Table.HeaderCell align="right">Åpne {formatDate(rapportdato)}</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {kohorter.map((kohort) => (
                    <Table.Row key={`${kohort.fraOgMed}-${kohort.sakYtelse}`}>
                        <Table.DataCell>{formaterPeriode(kohort.fraOgMed, kohort.tilOgMed)}</Table.DataCell>
                        <Table.DataCell>{tekstFraKode(kohort.sakYtelse)}</Table.DataCell>
                        <Table.DataCell align="right">{kohort.antallStartet}</Table.DataCell>
                        <Table.DataCell>{fristtekst(kohort, 30)}</Table.DataCell>
                        <Table.DataCell>{fristtekst(kohort, 60)}</Table.DataCell>
                        <Table.DataCell>{fristtekst(kohort, 90)}</Table.DataCell>
                        <Table.DataCell align="right">{kohort.åpneVedTilOgMed}</Table.DataCell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    </div>
);

const Kohorter = ({ kohorter, rapportdato }: { kohorter: SakStatistikkKohort[]; rapportdato: string }) => {
    if (kohorter.length === 0) return null;
    const sorterteKohorter = [...kohorter].sort((a, b) => a.fraOgMed.localeCompare(b.fraOgMed));
    const summerteKohorter = summerKohorter(sorterteKohorter);
    const harFlereMottaksperioder = new Set(sorterteKohorter.map((kohort) => kohort.fraOgMed)).size > 1;

    return (
        <section aria-labelledby="kohorter-tittel">
            <VStack gap="4">
                <div>
                    <Heading id="kohorter-tittel" level="3" size="medium">
                        Behandlinger fulgt fra mottak
                    </Heading>
                    <BodyShort>
                        Behandlinger gruppert etter når de ble mottatt. De følges til første avsluttende status:
                        iverksatt, avsluttet eller avbrutt, og for klager også oversendt. Grunnlaget viser hvor mange
                        som har hatt hele fristen på 30, 60 eller 90 dager. Første tabell summerer hele den valgte
                        perioden.
                    </BodyShort>
                </div>
                <Alert variant="info">
                    <VStack gap="2">
                        <Label>Slik leser du tabellen</Label>
                        <BodyShort>
                            Tabellen grupperer behandlingene etter når de ble mottatt. Hvis 80 av 100 behandlinger ble
                            ferdige innen 30 dager, vises «80 av 100 (80 %)». Hvis bare 60 har rukket å få hele
                            90-dagersfristen før rapportdatoen, er grunnlaget for 90 dager 60. De øvrige regnes ikke som
                            forsinket. «Åpne» er behandlinger som fortsatt mangler en avsluttende status ved
                            rapportdatoen.
                        </BodyShort>
                    </VStack>
                </Alert>
                <Kohorttabell kohorter={summerteKohorter} rapportdato={rapportdato} />
                {harFlereMottaksperioder && (
                    <ExpansionCard aria-label="Mottaksperioder hver for seg">
                        <ExpansionCard.Header>
                            <ExpansionCard.Title as="h4" size="small">
                                Vis mottaksperiodene hver for seg
                            </ExpansionCard.Title>
                        </ExpansionCard.Header>
                        <ExpansionCard.Content>
                            <Kohorttabell kohorter={[...sorterteKohorter].reverse()} rapportdato={rapportdato} />
                        </ExpansionCard.Content>
                    </ExpansionCard>
                )}
            </VStack>
        </section>
    );
};

const Datagrunnlag = ({ data }: { data: SakStatistikkResponse }) => (
    <ExpansionCard aria-label="Opplysninger om datagrunnlaget">
        <ExpansionCard.Header>
            <ExpansionCard.Title as="h3" size="small">
                Om datagrunnlaget
            </ExpansionCard.Title>
            <ExpansionCard.Description>
                Gjelder hele rapportperioden og påvirkes ikke av kategori- eller ytelsesfilteret.
            </ExpansionCard.Description>
        </ExpansionCard.Header>
        <ExpansionCard.Content>
            <VStack gap="4">
                {data.metadata.behandlingerMedFlereUtfall > 0 && (
                    <Alert variant="info">
                        {data.metadata.behandlingerMedFlereUtfall.toLocaleString('nb-NO')} behandlinger har flere
                        registrerte utfall. Antall statusoverganger er derfor ikke det samme som antall behandlinger.
                    </Alert>
                )}
                <div className={styles.tabellRamme}>
                    <Table size="small">
                        <Table.Body>
                            <Table.Row>
                                <Table.HeaderCell scope="row">Rapportperiode</Table.HeaderCell>
                                <Table.DataCell>{formaterPeriode(data.fraOgMed, data.tilOgMed)}</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.HeaderCell scope="row">Aggregatversjon</Table.HeaderCell>
                                <Table.DataCell>{data.metadata.aggregatversjon}</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.HeaderCell scope="row">Behandlinger i datagrunnlaget</Table.HeaderCell>
                                <Table.DataCell>
                                    {data.metadata.antallBehandlinger.toLocaleString('nb-NO')}
                                </Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.HeaderCell scope="row">Behandlinger med flere utfall</Table.HeaderCell>
                                <Table.DataCell>
                                    {data.metadata.behandlingerMedFlereUtfall.toLocaleString('nb-NO')}
                                </Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.HeaderCell scope="row">Siste hendelse</Table.HeaderCell>
                                <Table.DataCell>
                                    {data.metadata.sisteHendelseTidspunkt
                                        ? formatDateTime(data.metadata.sisteHendelseTidspunkt)
                                        : 'Ukjent'}
                                </Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.HeaderCell scope="row">Siste sekvens-ID</Table.HeaderCell>
                                <Table.DataCell>{data.metadata.maksSekvensId ?? 'Ukjent'}</Table.DataCell>
                            </Table.Row>
                        </Table.Body>
                    </Table>
                </div>
            </VStack>
        </ExpansionCard.Content>
    </ExpansionCard>
);

interface SummertPeriode {
    fraOgMed: string;
    tilOgMed: string;
    grupper: { navn: string; antall: number }[];
}

const diagramfarger = [
    styles.diagramfarge1,
    styles.diagramfarge2,
    styles.diagramfarge3,
    styles.diagramfarge4,
    styles.diagramfarge5,
    styles.diagramfarge6,
    styles.diagramfarge7,
    styles.diagramfarge8,
];

const stabletDiagram = (
    id: string,
    tittel: string,
    beskrivelse: string,
    perioder: SummertPeriode[],
    kolonner: string[],
    hovedvisning: 'SUMMER_PERIODEN' | 'SISTE_PERIODE',
) => {
    const sistePeriodeMedData = [...perioder]
        .reverse()
        .find((periode) => periode.grupper.some((gruppe) => gruppe.antall > 0));
    const summertPeriode =
        perioder.length === 0
            ? null
            : {
                  fraOgMed: perioder[0].fraOgMed,
                  tilOgMed: perioder.at(-1)?.tilOgMed ?? perioder[0].tilOgMed,
                  grupper: kolonner
                      .map((navn) => ({
                          navn,
                          antall: summer(
                              perioder.flatMap((periode) =>
                                  periode.grupper
                                      .filter((gruppe) => gruppe.navn === navn)
                                      .map((gruppe) => gruppe.antall),
                              ),
                          ),
                      }))
                      .filter((gruppe) => gruppe.antall > 0),
              };
    const hovedperiode = hovedvisning === 'SUMMER_PERIODEN' ? summertPeriode : sistePeriodeMedData;
    const detaljperioder =
        hovedvisning === 'SUMMER_PERIODEN'
            ? [...perioder].reverse()
            : [...perioder].reverse().filter((periode) => periode !== sistePeriodeMedData);
    const maksimum = Math.max(
        1,
        ...(hovedperiode?.grupper.map((gruppe) => gruppe.antall) ?? []),
        ...detaljperioder.flatMap((periode) => periode.grupper.map((gruppe) => gruppe.antall)),
    );
    const fargerekkefølge = [
        ...(hovedperiode?.grupper.map((gruppe) => gruppe.navn) ?? []),
        ...kolonner.filter((kolonne) => !hovedperiode?.grupper.some((gruppe) => gruppe.navn === kolonne)),
    ];
    const visPeriode = (periode: SummertPeriode) => (
        <div className={styles.periodegruppe} key={periode.fraOgMed}>
            <Label>{formaterPeriode(periode.fraOgMed, periode.tilOgMed)}</Label>
            {periode.grupper.length === 0 ? (
                <BodyShort>Ingen data i perioden.</BodyShort>
            ) : (
                <div className={styles.horisontaleSøyler}>
                    {periode.grupper.map((gruppe) => (
                        <div className={styles.horisontalSøyleRad} key={gruppe.navn}>
                            <span>{tekstFraKode(gruppe.navn)}</span>
                            <span className={styles.søylespor}>
                                <span
                                    className={`${styles.søylefyll} ${
                                        diagramfarger[fargerekkefølge.indexOf(gruppe.navn) % diagramfarger.length]
                                    }`}
                                    style={{ width: `${(gruppe.antall / maksimum) * 100}%` }}
                                />
                            </span>
                            <strong>{gruppe.antall}</strong>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <section aria-labelledby={id}>
            <VStack gap="4">
                <div>
                    <Heading id={id} level="3" size="medium">
                        {tittel}
                    </Heading>
                    <BodyShort>{beskrivelse}</BodyShort>
                </div>
                {hovedperiode && hovedperiode.grupper.length > 0 ? (
                    <div className={styles.søylediagram} aria-hidden="true">
                        {visPeriode(hovedperiode)}
                    </div>
                ) : (
                    <Alert variant="info">Ingen data i den valgte perioden.</Alert>
                )}
                {detaljperioder.length > 0 && (
                    <ExpansionCard
                        aria-label={`${
                            hovedvisning === 'SUMMER_PERIODEN' ? 'Delperioder' : 'Tidligere perioder'
                        } for ${tittel.toLocaleLowerCase('nb-NO')}`}
                    >
                        <ExpansionCard.Header>
                            <ExpansionCard.Title as="h4" size="small">
                                {hovedvisning === 'SUMMER_PERIODEN'
                                    ? 'Vis periodene hver for seg'
                                    : 'Vis tidligere perioder'}
                            </ExpansionCard.Title>
                            <ExpansionCard.Description>
                                Periodene er sortert med den nyeste først.
                            </ExpansionCard.Description>
                        </ExpansionCard.Header>
                        <ExpansionCard.Content>
                            <VStack gap="6">
                                <div className={styles.søylediagram} aria-hidden="true">
                                    {detaljperioder.map(visPeriode)}
                                </div>
                                <div className={styles.tabellRamme}>
                                    <Table size="small">
                                        <Table.Header>
                                            <Table.Row>
                                                <Table.HeaderCell>Periode</Table.HeaderCell>
                                                {kolonner.map((kolonne) => (
                                                    <Table.HeaderCell key={kolonne} align="right">
                                                        {tekstFraKode(kolonne)}
                                                    </Table.HeaderCell>
                                                ))}
                                            </Table.Row>
                                        </Table.Header>
                                        <Table.Body>
                                            {detaljperioder.map((periode) => (
                                                <Table.Row key={periode.fraOgMed}>
                                                    <Table.DataCell>
                                                        {formaterPeriode(periode.fraOgMed, periode.tilOgMed)}
                                                    </Table.DataCell>
                                                    {periode.grupper.length === 0 ? (
                                                        <Table.DataCell colSpan={Math.max(1, kolonner.length)}>
                                                            Ingen data
                                                        </Table.DataCell>
                                                    ) : (
                                                        kolonner.map((kolonne) => (
                                                            <Table.DataCell key={kolonne} align="right">
                                                                {periode.grupper.find(
                                                                    (gruppe) => gruppe.navn === kolonne,
                                                                )?.antall ?? 0}
                                                            </Table.DataCell>
                                                        ))
                                                    )}
                                                </Table.Row>
                                            ))}
                                        </Table.Body>
                                    </Table>
                                </div>
                            </VStack>
                        </ExpansionCard.Content>
                    </ExpansionCard>
                )}
            </VStack>
        </section>
    );
};

const grupperPerPeriode = (
    perioder: SakStatistikkPeriode[],
    hentRader: (periode: SakStatistikkPeriode) => { navn: string; antall: number }[],
): SummertPeriode[] =>
    perioder.map((periode) => {
        const grupper = new Map<string, number>();
        hentRader(periode).forEach((rad) => grupper.set(rad.navn, (grupper.get(rad.navn) ?? 0) + rad.antall));
        return {
            fraOgMed: periode.fraOgMed,
            tilOgMed: periode.tilOgMed,
            grupper: [...grupper].map(([navn, antall]) => ({ navn, antall })),
        };
    });

const AntallDiagram = ({
    perioder,
    kategori,
}: {
    perioder: SakStatistikkPeriode[];
    kategori: SakStatistikkKategori;
}) => {
    const data = grupperPerPeriode(perioder, (periode) =>
        periode.antall.map((rad) => ({
            navn: rad.behandlingAarsak
                ? `${tekstFraKode(rad.sakYtelse)} / ${tekstFraKode(rad.behandlingAarsak)}`
                : tekstFraKode(rad.sakYtelse),
            antall: rad.antall,
        })),
    );
    const kolonner = [...new Set(data.flatMap((periode) => periode.grupper.map((gruppe) => gruppe.navn)))];
    return stabletDiagram(
        'antall-tittel',
        'Registrerte behandlinger',
        kategori === 'SØKNAD'
            ? 'Behandlinger som ble registrert i perioden. Behandlingsårsaken sier hvorfor behandlingen ble opprettet. «Ny behandling av tidligere avslag» er ikke en ny søknad fra brukeren.'
            : 'Behandlinger som ble registrert i perioden. Behandlingsårsaken sier hvorfor behandlingen ble opprettet. Utfallet vises separat og kan komme i en senere periode.',
        data,
        kolonner,
        'SUMMER_PERIODEN',
    );
};

const BeholdningDiagram = ({ perioder }: { perioder: SakStatistikkPeriode[] }) => {
    const data = grupperPerPeriode(perioder, (periode) =>
        periode.beholdning.map((rad) => ({ navn: rad.status, antall: rad.antall })),
    );
    const kolonner = [...new Set(data.flatMap((periode) => periode.grupper.map((gruppe) => gruppe.navn)))];
    return stabletDiagram(
        'beholdning-tittel',
        'Beholdning',
        'Behandlinger som fortsatt var åpne hos vedtaksinstansen ved periodens slutt, fordelt etter siste registrerte status. Avsluttende statuser og oversendte klager inngår ikke. Behandlingene kan ha startet tidligere, og periodene summeres ikke.',
        data,
        kolonner,
        'SISTE_PERIODE',
    );
};

const UtfallDiagram = ({ perioder }: { perioder: SakStatistikkPeriode[] }) => {
    const data = grupperPerPeriode(perioder, (periode) =>
        periode.utfall.map((rad) => ({
            navn: `${rad.status}${rad.resultat ? ` / ${rad.resultat}` : ''}`,
            antall: rad.antall,
        })),
    );
    const kolonner = [...new Set(data.flatMap((periode) => periode.grupper.map((gruppe) => gruppe.navn)))];
    return stabletDiagram(
        'utfall-tittel',
        'Utfall i perioden',
        'Statusoverganger til iverksatt, avsluttet, avbrutt eller oversendt og resultatet som ble registrert. Behandlingsårsaken sier hvorfor behandlingen ble opprettet, mens resultatet sier hva den endte med. Utfallet kan gjelde en behandling som startet i en tidligere periode.',
        data,
        kolonner,
        'SUMMER_PERIODEN',
    );
};

export default SakstatistikkPanel;
