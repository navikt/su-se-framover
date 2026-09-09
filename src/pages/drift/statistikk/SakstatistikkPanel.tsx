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
    SakStatistikkKategori,
    SakStatistikkPeriode,
    SakStatistikkResponse,
    Statistikkoppløsning,
} from '~src/types/Statistikk';
import { formatDate, parseNonNullableIsoDateOnly, toIsoDateOnlyString } from '~src/utils/date/dateUtils';

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
    Standardperiode,
    summer,
} from './statistikkUtils';
import { useSakstatistikk } from './useStatistikk';

const kategorier: SakStatistikkKategori[] = [
    'SØKNAD',
    'REVURDERING',
    'KLAGE',
    'STANS',
    'GJENOPPTAK',
    'REGULERING',
    'TILBAKEKREVING',
];

const målinger: Behandlingstidsmåling[] = [
    'TOTAL_BEHANDLINGSTID',
    'SAKSBEHANDLING_FØR_ATTESTERING',
    'TID_HOS_ATTESTANT',
    'TID_ETTER_UNDERKJENNING',
];

const målingstekst: Record<Behandlingstidsmåling, string> = {
    TOTAL_BEHANDLINGSTID: 'Behandlingsstart → første utfall',
    SAKSBEHANDLING_FØR_ATTESTERING: 'Registrert → til attestering',
    TID_HOS_ATTESTANT: 'Til attestering → iverksatt eller underkjent',
    TID_ETTER_UNDERKJENNING: 'Underkjent → til attestering på nytt',
};

const målingsforklaring: Record<Behandlingstidsmåling, string> = {
    TOTAL_BEHANDLINGSTID:
        'Fra første registrerte hendelse til behandlingen først blir iverksatt, avsluttet, avbrutt eller oversendt.',
    SAKSBEHANDLING_FØR_ATTESTERING: 'Tiden fra behandlingen ble registrert til den ble sendt til attestering.',
    TID_HOS_ATTESTANT: 'Tiden fra attestering startet til behandlingen ble iverksatt eller underkjent.',
    TID_ETTER_UNDERKJENNING: 'Tiden fra underkjenning til behandlingen ble sendt til attestering på nytt.',
};

const tekstFraKode = (verdi: string): string => {
    const småBokstaver = verdi.replaceAll('_', ' ').toLocaleLowerCase('nb-NO');
    return småBokstaver.charAt(0).toLocaleUpperCase('nb-NO') + småBokstaver.slice(1);
};

const formaterDager = (dager: number): string =>
    new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(dager);

const formaterPeriode = (fraOgMed: string, tilOgMed: string): string =>
    `${formatDate(parseNonNullableIsoDateOnly(fraOgMed))}–${formatDate(parseNonNullableIsoDateOnly(tilOgMed))}`;

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
    if (!harSakstatistikk(perioder)) {
        return <Alert variant="info">Ingen statistikk for valgt periode.</Alert>;
    }

    return (
        <VStack gap={{ xs: '6', md: '8' }}>
            <StatistikkortGrid perioder={perioder} kategori={props.kategori} ytelse={props.ytelse} />
            <BehandlingstidKortGrid perioder={props.data.perioder} kategori={props.kategori} ytelse={props.ytelse} />
            <AntallDiagram perioder={perioder} />
            <UtfallDiagram perioder={perioder} />
            <BeholdningDiagram perioder={perioder} />
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
            tittel: 'Nye behandlinger i perioden',
            verdi: summer(props.perioder.flatMap((periode) => periode.antall.map((rad) => rad.antall))).toLocaleString(
                'nb-NO',
            ),
            detaljer: 'Behandlinger som startet i hele den valgte perioden.',
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
            detaljer: 'Siste kjente status på sluttdatoen. Tidligere perioder summeres ikke.',
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
                                {målinger.map((måling) => (
                                    <li key={måling}>
                                        <strong>{målingstekst[måling]}:</strong> {målingsforklaring[måling]}
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
                            {målinger.map((måling) => {
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
                                            <Label>{målingstekst[måling]}</Label>
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
                        {tekstFraKode(props.kategori)}: {målingstekst[props.måling]} fra{' '}
                        {formaterPeriode(props.fraOgMed, props.tilOgMed)}
                    </Heading>
                    <div className={styles.beskrivelseMedHjelp}>
                        <BodyShort as="span">
                            {målingsforklaring[props.måling]} Median vises med heltrukken linje. 90-persentilen vises
                            stiplet.
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
];

const stabletDiagram = (
    id: string,
    tittel: string,
    beskrivelse: string,
    perioder: SummertPeriode[],
    kolonner: string[],
) => {
    const maksimum = Math.max(1, ...perioder.flatMap((periode) => periode.grupper.map((gruppe) => gruppe.antall)));
    const sistePeriodeMedData = [...perioder]
        .reverse()
        .find((periode) => periode.grupper.some((gruppe) => gruppe.antall > 0));
    const tidligerePerioder = [...perioder].reverse().filter((periode) => periode !== sistePeriodeMedData);
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
                                        diagramfarger[kolonner.indexOf(gruppe.navn) % diagramfarger.length]
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
                {sistePeriodeMedData ? (
                    <div className={styles.søylediagram} aria-hidden="true">
                        {visPeriode(sistePeriodeMedData)}
                    </div>
                ) : (
                    <Alert variant="info">Ingen data i den valgte perioden.</Alert>
                )}
                {tidligerePerioder.length > 0 && (
                    <ExpansionCard aria-label={`Tidligere perioder for ${tittel.toLocaleLowerCase('nb-NO')}`}>
                        <ExpansionCard.Header>
                            <ExpansionCard.Title as="h4" size="small">
                                Vis tidligere perioder
                            </ExpansionCard.Title>
                            <ExpansionCard.Description>
                                Periodene er sortert med den nyeste først.
                            </ExpansionCard.Description>
                        </ExpansionCard.Header>
                        <ExpansionCard.Content>
                            <VStack gap="6">
                                <div className={styles.søylediagram} aria-hidden="true">
                                    {tidligerePerioder.map(visPeriode)}
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
                                            {tidligerePerioder.map((periode) => (
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

const AntallDiagram = ({ perioder }: { perioder: SakStatistikkPeriode[] }) => {
    const data = grupperPerPeriode(perioder, (periode) =>
        periode.antall.map((rad) => ({
            navn: `${tekstFraKode(rad.sakYtelse)} / ${
                rad.behandlingAarsak ? tekstFraKode(rad.behandlingAarsak) : 'Ingen oppgitt årsak'
            }`,
            antall: rad.antall,
        })),
    );
    const kolonner = [...new Set(data.flatMap((periode) => periode.grupper.map((gruppe) => gruppe.navn)))];
    return stabletDiagram(
        'antall-tittel',
        'Nye behandlinger',
        'Antall behandlinger som startet i perioden, fordelt på ytelse og behandlingsårsak.',
        data,
        kolonner,
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
        'Beholdningen viser status ved slutten av hver periode. Periodene summeres ikke.',
        data,
        kolonner,
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
        'Viser antall overganger til en ny status og resultatet som ble registrert, for eksempel «Iverksatt / innvilget».',
        data,
        kolonner,
    );
};

export default SakstatistikkPanel;
