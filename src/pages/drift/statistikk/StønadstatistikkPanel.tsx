import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyShort, Box, Button, ExpansionCard, Heading, HGrid, Select, Table, VStack } from '@navikt/ds-react';
import { useMemo, useState } from 'react';

import { MonthPicker } from '~src/components/inputs/datePicker/DatePicker';
import { StønadStatistikkPeriode, StønadStatistikkResponse } from '~src/types/Statistikk';
import { formatMonthYear, toIsoMonth } from '~src/utils/date/dateUtils';

import styles from './statistikk.module.less';
import { filtrerStønad, hentStønadMånedsantall, summer } from './statistikkUtils';
import { useStønadstatistikk } from './useStatistikk';

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

const førsteDagIMåned = (måned: string): Date => new Date(`${måned}-01T12:00:00`);
const forrigeMåned = (måned: string): string => {
    const dato = førsteDagIMåned(måned);
    dato.setMonth(dato.getMonth() - 1);
    return toIsoMonth(dato);
};

const månederIPeriode = (fraOgMed: string, tilOgMed: string): string[] => {
    const måneder: string[] = [];
    const måned = førsteDagIMåned(fraOgMed);
    const sisteMåned = førsteDagIMåned(tilOgMed);

    while (måned <= sisteMåned) {
        måneder.push(toIsoMonth(måned));
        måned.setMonth(måned.getMonth() + 1);
    }

    return måneder;
};

const MAKS_ANTALL_MÅNEDER = 24;

const forskyvMåned = (måned: string, antall: number): Date => {
    const dato = førsteDagIMåned(måned);
    dato.setMonth(dato.getMonth() + antall);
    return dato;
};

const finnPeriode = (perioder: StønadStatistikkPeriode[], måned: string): StønadStatistikkPeriode | null =>
    perioder.find((periode) => periode.måned === måned) ?? null;

const tekstFraKode = (verdi: string): string => {
    const tekst = verdi.replaceAll('_', ' ').toLocaleLowerCase('nb-NO');
    return tekst.charAt(0).toLocaleUpperCase('nb-NO') + tekst.slice(1);
};

const unikeVerdier = (data: StønadStatistikkResponse, felt: 'stønadstype' | 'vedtakstype' | 'vedtaksresultat') =>
    [...new Set(data.perioder.flatMap((periode) => periode.rader.map((rad) => rad[felt])))].sort();

const StønadstatistikkPanel = () => {
    const nå = new Date();
    const inneværendeÅr = nå.getFullYear();
    const tilgjengeligeÅr = Array.from({ length: Math.max(0, inneværendeÅr - 2021) }, (_, indeks) =>
        String(inneværendeÅr - indeks - 1),
    );
    const [periodevalg, setPeriodevalg] = useState('HITTIL_I_ÅR');
    const [fraOgMed, setFraOgMed] = useState(`${nå.getFullYear()}-01`);
    const [tilOgMed, setTilOgMed] = useState(toIsoMonth(nå));
    const [stønadstype, setStønadstype] = useState<string | null>(null);
    const [vedtakstype, setVedtakstype] = useState<string | null>(null);
    const [vedtaksresultat, setVedtaksresultat] = useState<string | null>(null);
    const [stønadsklassifisering, setStønadsklassifisering] = useState<string | null>(null);
    const inkluderSammenligningsmåned = månederIPeriode(fraOgMed, tilOgMed).length < MAKS_ANTALL_MÅNEDER;
    const { status, genererer, prøvIgjen } = useStønadstatistikk({
        fraOgMed: inkluderSammenligningsmåned ? forrigeMåned(fraOgMed) : fraOgMed,
        tilOgMed,
    });

    const dataIValgtPeriode = useMemo(
        () => ({
            fraOgMed,
            tilOgMed,
            perioder: RemoteData.isSuccess(status)
                ? status.value.perioder.filter((periode) => periode.måned >= fraOgMed && periode.måned <= tilOgMed)
                : [],
        }),
        [status, fraOgMed, tilOgMed],
    );

    const filtrertDataMedSammenligningsmåned = useMemo(
        () =>
            RemoteData.isSuccess(status)
                ? filtrerStønad(status.value, { stønadstype, vedtakstype, vedtaksresultat, stønadsklassifisering })
                : null,
        [status, stønadstype, vedtakstype, vedtaksresultat, stønadsklassifisering],
    );

    const data = filtrertDataMedSammenligningsmåned
        ? {
              ...filtrertDataMedSammenligningsmåned,
              fraOgMed,
              tilOgMed,
              perioder: filtrertDataMedSammenligningsmåned.perioder.filter(
                  (periode) => periode.måned >= fraOgMed && periode.måned <= tilOgMed,
              ),
          }
        : null;

    const forrigeMånedsperiode = filtrertDataMedSammenligningsmåned?.perioder.find(
        (periode) => periode.måned === forrigeMåned(tilOgMed),
    );
    const forrigeMånedsAntall =
        forrigeMånedsperiode?.datagrunnlag === 'TILGJENGELIG'
            ? summer(forrigeMånedsperiode.rader.map((rad) => rad.antall))
            : null;

    const alleKlassifiseringer = RemoteData.isSuccess(status)
        ? [
              ...new Set(
                  dataIValgtPeriode.perioder.flatMap((periode) =>
                      periode.rader
                          .map((rad) => rad.stønadsklassifisering)
                          .filter((verdi): verdi is string => verdi !== null),
                  ),
              ),
          ].sort()
        : [];

    const velgPeriode = (valg: string) => {
        setPeriodevalg(valg);
        if (valg === 'EGENDEFINERT') return;
        if (valg === 'HITTIL_I_ÅR') {
            setFraOgMed(`${inneværendeÅr}-01`);
            setTilOgMed(toIsoMonth(nå));
            return;
        }
        if (valg === 'ÉN_MÅNED') {
            setFraOgMed(tilOgMed);
            return;
        }
        setFraOgMed(`${valg}-01`);
        setTilOgMed(`${valg}-12`);
    };

    return (
        <VStack gap={{ xs: '6', md: '8' }} className={styles.panel}>
            <HGrid columns={{ xs: 1, sm: 2, lg: 3 }} gap={{ xs: '4', md: '6' }} as="form" className={styles.filterGrid}>
                <Select label="Periode" value={periodevalg} onChange={(event) => velgPeriode(event.target.value)}>
                    <option value="HITTIL_I_ÅR">Hittil i år (januar–{formatMonthYear(nå).split(' ')[0]})</option>
                    <option value="ÉN_MÅNED">Én måned</option>
                    {tilgjengeligeÅr.map((år) => (
                        <option key={år} value={år}>
                            Hele {år}
                        </option>
                    ))}
                    <option value="EGENDEFINERT">Egendefinert månedsspenn</option>
                </Select>
                {periodevalg === 'ÉN_MÅNED' && (
                    <MonthPicker
                        label="Måned"
                        value={førsteDagIMåned(tilOgMed)}
                        onChange={(dato) => {
                            if (!dato) return;
                            const måned = toIsoMonth(dato);
                            setFraOgMed(måned);
                            setTilOgMed(måned);
                        }}
                    />
                )}
                {periodevalg === 'EGENDEFINERT' && (
                    <>
                        <MonthPicker
                            label="Fra og med måned"
                            value={førsteDagIMåned(fraOgMed)}
                            fromDate={forskyvMåned(tilOgMed, -(MAKS_ANTALL_MÅNEDER - 1))}
                            toDate={førsteDagIMåned(tilOgMed)}
                            onChange={(dato) => {
                                if (dato) setFraOgMed(toIsoMonth(dato));
                            }}
                        />
                        <MonthPicker
                            label="Til og med måned"
                            value={førsteDagIMåned(tilOgMed)}
                            fromDate={førsteDagIMåned(fraOgMed)}
                            toDate={forskyvMåned(fraOgMed, MAKS_ANTALL_MÅNEDER - 1)}
                            onChange={(dato) => {
                                if (dato) setTilOgMed(toIsoMonth(dato));
                            }}
                        />
                    </>
                )}
                <Select
                    label="Stønadstype"
                    value={stønadstype ?? ''}
                    onChange={(e) => setStønadstype(e.target.value || null)}
                >
                    <option value="">Alle stønadstyper</option>
                    {RemoteData.isSuccess(status) &&
                        unikeVerdier(dataIValgtPeriode, 'stønadstype').map((verdi) => (
                            <option key={verdi} value={verdi}>
                                {tekstFraKode(verdi)}
                            </option>
                        ))}
                </Select>
                <Select
                    label="Vedtakstype"
                    value={vedtakstype ?? ''}
                    onChange={(e) => setVedtakstype(e.target.value || null)}
                >
                    <option value="">Alle vedtakstyper</option>
                    {RemoteData.isSuccess(status) &&
                        unikeVerdier(dataIValgtPeriode, 'vedtakstype').map((verdi) => (
                            <option key={verdi} value={verdi}>
                                {tekstFraKode(verdi)}
                            </option>
                        ))}
                </Select>
                <Select
                    label="Vedtaksresultat"
                    value={vedtaksresultat ?? ''}
                    onChange={(e) => setVedtaksresultat(e.target.value || null)}
                >
                    <option value="">Alle vedtaksresultater</option>
                    {RemoteData.isSuccess(status) &&
                        unikeVerdier(dataIValgtPeriode, 'vedtaksresultat').map((verdi) => (
                            <option key={verdi} value={verdi}>
                                {tekstFraKode(verdi)}
                            </option>
                        ))}
                </Select>
                <Select
                    label="Stønadsklassifisering"
                    value={stønadsklassifisering ?? ''}
                    onChange={(e) => setStønadsklassifisering(e.target.value || null)}
                >
                    <option value="">Alle klassifiseringer</option>
                    {alleKlassifiseringer.map((verdi) => (
                        <option key={verdi} value={verdi}>
                            {tekstFraKode(verdi)}
                        </option>
                    ))}
                </Select>
            </HGrid>

            <div className="sr-only" aria-live="polite">
                {genererer
                    ? 'Vi lager stønadsstatistikken.'
                    : RemoteData.isPending(status)
                      ? 'Henter stønadsstatistikk.'
                      : data
                        ? `Viser ${data.perioder.length} måneder.`
                        : RemoteData.isFailure(status)
                          ? 'Stønadsstatistikken kunne ikke hentes.'
                          : null}
            </div>
            {RemoteData.isPending(status) && !genererer && <Alert variant="info">Henter stønadsstatistikk.</Alert>}
            {genererer && <Alert variant="info">Vi lager stønadsstatistikken. Dette kan ta litt tid.</Alert>}
            {RemoteData.isFailure(status) && (
                <Alert variant="error">
                    <VStack gap="3">
                        <BodyShort>
                            {status.error.statusCode === 400
                                ? 'Kontroller valgt periode.'
                                : 'Stønadsstatistikken kunne ikke hentes.'}
                        </BodyShort>
                        <div>
                            <Button size="small" variant="secondary" onClick={prøvIgjen}>
                                Prøv igjen
                            </Button>
                        </div>
                    </VStack>
                </Alert>
            )}
            {data &&
                (månederIPeriode(fraOgMed, tilOgMed).every(
                    (måned) => finnPeriode(dataIValgtPeriode.perioder, måned)?.datagrunnlag !== 'TILGJENGELIG',
                ) ? (
                    <Alert variant="info">Datagrunnlaget mangler for valgt periode.</Alert>
                ) : (
                    <StønadstatistikkInnhold
                        data={data}
                        forrigeMånedsAntall={forrigeMånedsAntall}
                        bestandsfilterKanVises={
                            vedtakstype === null && vedtaksresultat === null && stønadsklassifisering === null
                        }
                    />
                ))}
        </VStack>
    );
};

const StønadstatistikkInnhold = ({
    data,
    forrigeMånedsAntall,
    bestandsfilterKanVises,
}: {
    data: StønadStatistikkResponse;
    forrigeMånedsAntall: number | null;
    bestandsfilterKanVises: boolean;
}) => {
    const perMåned = månederIPeriode(data.fraOgMed, data.tilOgMed).map((måned) => {
        return {
            måned,
            antall: hentStønadMånedsantall(data, måned),
        };
    });
    const tilgjengeligeMåneder = perMåned.filter(
        (periode): periode is { måned: string; antall: number } => periode.antall !== null,
    );
    const første = tilgjengeligeMåneder[0];
    const siste = tilgjengeligeMåneder.at(-1);
    const erÉnMåned = perMåned.length === 1;
    const sammenligningsmåned = erÉnMåned ? (siste ? forrigeMåned(siste.måned) : null) : første?.måned;
    const sammenligningsantall = erÉnMåned ? forrigeMånedsAntall : første?.antall;
    const endring =
        siste &&
        sammenligningsmåned !== siste.måned &&
        sammenligningsantall !== null &&
        sammenligningsantall !== undefined &&
        sammenligningsantall !== 0
            ? ((siste.antall - sammenligningsantall) / sammenligningsantall) * 100
            : null;
    const manglendeMåneder = perMåned.filter((periode) => periode.antall === null);
    const gjennomsnittPerMåned =
        tilgjengeligeMåneder.length === 0
            ? null
            : summer(tilgjengeligeMåneder.map((periode) => periode.antall)) / tilgjengeligeMåneder.length;
    const resultater = [
        ...new Set(data.perioder.flatMap((periode) => periode.rader.map((rad) => rad.vedtaksresultat))),
    ].sort();
    const resultatperioder = månederIPeriode(data.fraOgMed, data.tilOgMed).map((måned) => {
        const periode = finnPeriode(data.perioder, måned);
        return {
            måned,
            grupper:
                periode?.datagrunnlag === 'TILGJENGELIG'
                    ? resultater.map((resultat) => ({
                          resultat,
                          antall: summer(
                              periode.rader.filter((rad) => rad.vedtaksresultat === resultat).map((rad) => rad.antall),
                          ),
                      }))
                    : null,
        };
    });
    const sisteResultatperiode = [...resultatperioder].reverse().find((periode) => periode.grupper !== null);
    const størsteResultat = Math.max(1, ...(sisteResultatperiode?.grupper?.map((gruppe) => gruppe.antall) ?? []));

    return (
        <VStack gap={{ xs: '6', md: '8' }}>
            <HGrid columns={{ xs: 1, sm: 3 }} gap={{ xs: '4', md: '6' }}>
                <Oppsummeringskort
                    tittel={`${formatMonthYear(førsteDagIMåned(siste?.måned ?? data.tilOgMed))}${
                        siste?.måned !== data.tilOgMed ? ' (siste måned med data)' : ''
                    }`}
                    verdi={siste?.antall?.toLocaleString('nb-NO') ?? 'Mangler data'}
                />
                <Oppsummeringskort
                    tittel={
                        sammenligningsmåned && siste
                            ? `Endring fra ${formatMonthYear(
                                  førsteDagIMåned(sammenligningsmåned),
                              )} til ${formatMonthYear(førsteDagIMåned(siste.måned))}`
                            : 'Endring fra forrige måned'
                    }
                    verdi={endring === null ? 'Ikke nok data' : `${endring >= 0 ? '+' : ''}${endring.toFixed(1)} %`}
                />
                <Oppsummeringskort
                    tittel="Gjennomsnitt per måned"
                    verdi={
                        gjennomsnittPerMåned === null
                            ? 'Mangler data'
                            : new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 1 }).format(gjennomsnittPerMåned)
                    }
                    beskrivelse={`${tilgjengeligeMåneder.length} ${
                        tilgjengeligeMåneder.length === 1 ? 'måned inngår' : 'måneder inngår'
                    }${
                        manglendeMåneder.length > 0
                            ? `. ${manglendeMåneder.length} ${
                                  manglendeMåneder.length === 1 ? 'måned mangler' : 'måneder mangler'
                              } data`
                            : ''
                    }.`}
                />
            </HGrid>
            <BodyShort>
                Hver månedsverdi viser antall saker med stønad den måneden. Den samme saken kan inngå i flere måneder.
                Gjennomsnittet er derfor ikke antall unike saker eller personer.
            </BodyShort>

            <Månedsutvikling perioder={perMåned} />

            <section aria-labelledby="stønad-per-måned">
                <VStack gap="4">
                    <Heading id="stønad-per-måned" level="3" size="medium">
                        Vedtaksresultat
                    </Heading>
                    <BodyShort>Antall per vedtaksresultat i siste måned med data.</BodyShort>
                    {sisteResultatperiode ? (
                        <div className={styles.periodegruppe} aria-hidden="true">
                            <Heading level="4" size="small">
                                {formatMonthYear(førsteDagIMåned(sisteResultatperiode.måned))}
                                {sisteResultatperiode.måned !== data.tilOgMed ? ' (siste måned med data)' : ''}
                            </Heading>
                            {sisteResultatperiode.grupper?.some((gruppe) => gruppe.antall > 0) ? (
                                <div className={styles.horisontaleSøyler}>
                                    {sisteResultatperiode.grupper
                                        .filter((gruppe) => gruppe.antall > 0)
                                        .map((gruppe) => (
                                            <div className={styles.horisontalSøyleRad} key={gruppe.resultat}>
                                                <span>{tekstFraKode(gruppe.resultat)}</span>
                                                <span className={styles.søylespor}>
                                                    <span
                                                        className={`${styles.søylefyll} ${
                                                            diagramfarger[
                                                                resultater.indexOf(gruppe.resultat) %
                                                                    diagramfarger.length
                                                            ]
                                                        }`}
                                                        style={{ width: `${(gruppe.antall / størsteResultat) * 100}%` }}
                                                    />
                                                </span>
                                                <strong>{gruppe.antall}</strong>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <BodyShort>Ingen vedtaksresultater i måneden.</BodyShort>
                            )}
                        </div>
                    ) : (
                        <BodyShort>Ingen vedtaksresultater i perioden.</BodyShort>
                    )}
                    <ExpansionCard aria-label="Vedtaksresultat for alle måneder">
                        <ExpansionCard.Header>
                            <ExpansionCard.Title as="h4" size="small">
                                Vis alle måneder
                            </ExpansionCard.Title>
                            <ExpansionCard.Description>
                                Se antall vedtaksresultater for hver måned.
                            </ExpansionCard.Description>
                        </ExpansionCard.Header>
                        <ExpansionCard.Content>
                            <div className={styles.tabellRamme}>
                                <Table size="small">
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>Måned</Table.HeaderCell>
                                            {resultater.map((resultat) => (
                                                <Table.HeaderCell key={resultat} align="right">
                                                    {tekstFraKode(resultat)}
                                                </Table.HeaderCell>
                                            ))}
                                            <Table.HeaderCell align="right">Totalt</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {resultatperioder.map((periode) => (
                                            <Table.Row key={periode.måned}>
                                                <Table.DataCell>
                                                    {formatMonthYear(førsteDagIMåned(periode.måned))}
                                                </Table.DataCell>
                                                {periode.grupper ? (
                                                    <>
                                                        {periode.grupper.map((gruppe) => (
                                                            <Table.DataCell key={gruppe.resultat} align="right">
                                                                {gruppe.antall}
                                                            </Table.DataCell>
                                                        ))}
                                                        <Table.DataCell align="right">
                                                            {summer(periode.grupper.map((gruppe) => gruppe.antall))}
                                                        </Table.DataCell>
                                                    </>
                                                ) : (
                                                    <Table.DataCell colSpan={resultater.length + 1}>
                                                        Mangler datagrunnlag
                                                    </Table.DataCell>
                                                )}
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table>
                            </div>
                        </ExpansionCard.Content>
                    </ExpansionCard>
                </VStack>
            </section>
            <Stønadsklassifisering data={data} />
            <Bestandsendringer data={data} kanVisesMedValgteFiltre={bestandsfilterKanVises} />
        </VStack>
    );
};

const Månedsutvikling = ({ perioder }: { perioder: { måned: string; antall: number | null }[] }) => {
    const maksimum = Math.max(1, ...perioder.flatMap((periode) => (periode.antall === null ? [] : [periode.antall])));

    return (
        <section aria-labelledby="stønad-månedsutvikling">
            <VStack gap="4">
                <div>
                    <Heading id="stønad-månedsutvikling" level="3" size="medium">
                        Stønad per måned
                    </Heading>
                    <BodyShort>Antall månedsforekomster i hver måned i den valgte perioden.</BodyShort>
                </div>
                <div className={styles.månedsdiagramRamme} aria-hidden="true">
                    <div className={styles.månedsdiagram}>
                        {perioder.map((periode) => (
                            <div className={styles.månedsSøyle} key={periode.måned}>
                                <strong>
                                    {periode.antall === null ? 'Mangler' : periode.antall.toLocaleString('nb-NO')}
                                </strong>
                                <span className={styles.månedsSøyleområde}>
                                    {periode.antall !== null && (
                                        <span
                                            className={`${styles.månedsSøylefyll} ${styles.diagramfarge1}`}
                                            style={{ height: `${(periode.antall / maksimum) * 100}%` }}
                                        />
                                    )}
                                </span>
                                <span>{formatMonthYear(førsteDagIMåned(periode.måned))}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <ExpansionCard aria-label="Stønad per måned som tabell">
                    <ExpansionCard.Header>
                        <ExpansionCard.Title as="h4" size="small">
                            Vis som tabell
                        </ExpansionCard.Title>
                        <ExpansionCard.Description>
                            Se antall månedsforekomster for hver måned.
                        </ExpansionCard.Description>
                    </ExpansionCard.Header>
                    <ExpansionCard.Content>
                        <div className={styles.tabellRamme}>
                            <Table size="small">
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>Måned</Table.HeaderCell>
                                        <Table.HeaderCell align="right">Antall</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {perioder.map((periode) => (
                                        <Table.Row key={periode.måned}>
                                            <Table.DataCell>
                                                {formatMonthYear(førsteDagIMåned(periode.måned))}
                                            </Table.DataCell>
                                            <Table.DataCell align="right">
                                                {periode.antall === null ? 'Mangler datagrunnlag' : periode.antall}
                                            </Table.DataCell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        </div>
                    </ExpansionCard.Content>
                </ExpansionCard>
            </VStack>
        </section>
    );
};

const Stønadsklassifisering = ({ data }: { data: StønadStatistikkResponse }) => {
    const klassifiseringer = [
        ...new Set(
            data.perioder.flatMap((periode) =>
                periode.rader.map((rad) => rad.stønadsklassifisering ?? 'IKKE_KLASSIFISERT'),
            ),
        ),
    ].sort();
    const perioder = månederIPeriode(data.fraOgMed, data.tilOgMed).map((måned) => {
        const periode = finnPeriode(data.perioder, måned);
        return {
            måned,
            grupper:
                periode?.datagrunnlag === 'TILGJENGELIG'
                    ? klassifiseringer.map((klassifisering) => ({
                          klassifisering,
                          antall: summer(
                              periode.rader
                                  .filter(
                                      (rad) => (rad.stønadsklassifisering ?? 'IKKE_KLASSIFISERT') === klassifisering,
                                  )
                                  .map((rad) => rad.antall),
                          ),
                      }))
                    : null,
        };
    });
    const sistePeriode = [...perioder].reverse().find((periode) => periode.grupper !== null);
    const maksimum = Math.max(1, ...(sistePeriode?.grupper?.map((gruppe) => gruppe.antall) ?? []));

    return (
        <section aria-labelledby="stønadsklassifisering-tittel">
            <VStack gap="4">
                <div>
                    <Heading id="stønadsklassifisering-tittel" level="3" size="medium">
                        Stønadsklassifisering
                    </Heading>
                    <BodyShort>
                        Antall per klassifisering i siste måned med data. Den samme saken kan inngå i flere måneder, så
                        månedene summeres ikke.
                    </BodyShort>
                </div>
                {sistePeriode ? (
                    <div className={styles.periodegruppe} aria-hidden="true">
                        <Heading level="4" size="small">
                            {formatMonthYear(førsteDagIMåned(sistePeriode.måned))}
                            {sistePeriode.måned !== data.tilOgMed ? ' (siste måned med data)' : ''}
                        </Heading>
                        {sistePeriode.grupper?.some((gruppe) => gruppe.antall > 0) ? (
                            <div className={styles.horisontaleSøyler}>
                                {sistePeriode.grupper
                                    .filter((gruppe) => gruppe.antall > 0)
                                    .map((gruppe) => (
                                        <div className={styles.horisontalSøyleRad} key={gruppe.klassifisering}>
                                            <span>{tekstFraKode(gruppe.klassifisering)}</span>
                                            <span className={styles.søylespor}>
                                                <span
                                                    className={`${styles.søylefyll} ${
                                                        diagramfarger[
                                                            klassifiseringer.indexOf(gruppe.klassifisering) %
                                                                diagramfarger.length
                                                        ]
                                                    }`}
                                                    style={{ width: `${(gruppe.antall / maksimum) * 100}%` }}
                                                />
                                            </span>
                                            <strong>{gruppe.antall}</strong>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <BodyShort>Ingen stønadsklassifiseringer i måneden.</BodyShort>
                        )}
                    </div>
                ) : (
                    <BodyShort>Ingen stønadsklassifiseringer i perioden.</BodyShort>
                )}
                <ExpansionCard aria-label="Stønadsklassifisering for alle måneder">
                    <ExpansionCard.Header>
                        <ExpansionCard.Title as="h4" size="small">
                            Vis alle måneder
                        </ExpansionCard.Title>
                        <ExpansionCard.Description>
                            Se antall per stønadsklassifisering for hver måned.
                        </ExpansionCard.Description>
                    </ExpansionCard.Header>
                    <ExpansionCard.Content>
                        <div className={styles.tabellRamme}>
                            <Table size="small">
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>Måned</Table.HeaderCell>
                                        {klassifiseringer.map((klassifisering) => (
                                            <Table.HeaderCell key={klassifisering} align="right">
                                                {tekstFraKode(klassifisering)}
                                            </Table.HeaderCell>
                                        ))}
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {perioder.map((periode) => (
                                        <Table.Row key={periode.måned}>
                                            <Table.DataCell>
                                                {formatMonthYear(førsteDagIMåned(periode.måned))}
                                            </Table.DataCell>
                                            {periode.grupper ? (
                                                periode.grupper.map((gruppe) => (
                                                    <Table.DataCell key={gruppe.klassifisering} align="right">
                                                        {gruppe.antall}
                                                    </Table.DataCell>
                                                ))
                                            ) : (
                                                <Table.DataCell colSpan={Math.max(1, klassifiseringer.length)}>
                                                    Mangler datagrunnlag
                                                </Table.DataCell>
                                            )}
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        </div>
                    </ExpansionCard.Content>
                </ExpansionCard>
            </VStack>
        </section>
    );
};

const Bestandsendringer = ({
    data,
    kanVisesMedValgteFiltre,
}: {
    data: StønadStatistikkResponse;
    kanVisesMedValgteFiltre: boolean;
}) => {
    const sistePeriode = finnPeriode(data.perioder, data.tilOgMed);

    return (
        <section aria-labelledby="stønadsbestand-tittel">
            <VStack gap="4">
                <div>
                    <Heading id="stønadsbestand-tittel" level="3" size="medium">
                        Endringer i stønadsbestanden
                    </Heading>
                    <BodyShort>
                        Viser nye, videreførte og utgåtte saker sammenlignet med foregående kalendermåned.
                    </BodyShort>
                </div>
                {!kanVisesMedValgteFiltre ? (
                    <Alert variant="info">
                        Bestandsendringer kan ikke filtreres på vedtakstype, vedtaksresultat eller
                        stønadsklassifisering. Fjern disse filtrene for å se endringene.
                    </Alert>
                ) : !sistePeriode || !sistePeriode.bestandsendringerTilgjengelig ? (
                    <Alert variant="info">Kan ikke sammenlignes med forrige måned.</Alert>
                ) : sistePeriode.bestandsendringer.length === 0 ? (
                    <BodyShort>Det finnes ingen bestandsendringer i måneden.</BodyShort>
                ) : (
                    <VStack gap="5">
                        <Heading level="4" size="small">
                            {formatMonthYear(førsteDagIMåned(sistePeriode.måned))}
                        </Heading>
                        {sistePeriode.bestandsendringer.map((rad) => (
                            <VStack key={rad.stønadstype} gap="3">
                                <Heading level="5" size="xsmall">
                                    {tekstFraKode(rad.stønadstype)}
                                </Heading>
                                <HGrid columns={{ xs: 2, md: 4 }} gap="4">
                                    <Oppsummeringskort tittel="Nye" verdi={rad.nye.toLocaleString('nb-NO')} />
                                    <Oppsummeringskort
                                        tittel="Videreførte"
                                        verdi={rad.videreført.toLocaleString('nb-NO')}
                                    />
                                    <Oppsummeringskort tittel="Utgåtte" verdi={rad.utgått.toLocaleString('nb-NO')} />
                                    <Oppsummeringskort
                                        tittel="Endret klassifisering"
                                        verdi={rad.endretStønadsklassifisering.toLocaleString('nb-NO')}
                                    />
                                </HGrid>
                            </VStack>
                        ))}
                    </VStack>
                )}
                {kanVisesMedValgteFiltre && data.perioder.length > 1 && (
                    <ExpansionCard aria-label="Bestandsendringer for alle måneder">
                        <ExpansionCard.Header>
                            <ExpansionCard.Title as="h4" size="small">
                                Vis alle måneder
                            </ExpansionCard.Title>
                            <ExpansionCard.Description>
                                Endringene vises per måned og summeres ikke.
                            </ExpansionCard.Description>
                        </ExpansionCard.Header>
                        <ExpansionCard.Content>
                            <div className={styles.tabellRamme}>
                                <Table size="small">
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>Måned</Table.HeaderCell>
                                            <Table.HeaderCell>Stønadstype</Table.HeaderCell>
                                            <Table.HeaderCell align="right">Nye</Table.HeaderCell>
                                            <Table.HeaderCell align="right">Videreførte</Table.HeaderCell>
                                            <Table.HeaderCell align="right">Utgåtte</Table.HeaderCell>
                                            <Table.HeaderCell align="right">Endret klassifisering</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {data.perioder.flatMap((periode) => {
                                            const måned = formatMonthYear(førsteDagIMåned(periode.måned));
                                            if (!periode.bestandsendringerTilgjengelig) {
                                                return (
                                                    <Table.Row key={periode.måned}>
                                                        <Table.DataCell>{måned}</Table.DataCell>
                                                        <Table.DataCell colSpan={5}>
                                                            Kan ikke sammenlignes med forrige måned
                                                        </Table.DataCell>
                                                    </Table.Row>
                                                );
                                            }
                                            if (periode.bestandsendringer.length === 0) {
                                                return (
                                                    <Table.Row key={periode.måned}>
                                                        <Table.DataCell>{måned}</Table.DataCell>
                                                        <Table.DataCell colSpan={5}>
                                                            Ingen bestandsendringer
                                                        </Table.DataCell>
                                                    </Table.Row>
                                                );
                                            }
                                            return periode.bestandsendringer.map((rad) => (
                                                <Table.Row key={`${periode.måned}-${rad.stønadstype}`}>
                                                    <Table.DataCell>{måned}</Table.DataCell>
                                                    <Table.DataCell>{tekstFraKode(rad.stønadstype)}</Table.DataCell>
                                                    <Table.DataCell align="right">{rad.nye}</Table.DataCell>
                                                    <Table.DataCell align="right">{rad.videreført}</Table.DataCell>
                                                    <Table.DataCell align="right">{rad.utgått}</Table.DataCell>
                                                    <Table.DataCell align="right">
                                                        {rad.endretStønadsklassifisering}
                                                    </Table.DataCell>
                                                </Table.Row>
                                            ));
                                        })}
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

const Oppsummeringskort = ({ tittel, verdi, beskrivelse }: { tittel: string; verdi: string; beskrivelse?: string }) => (
    <Box background="surface-default" borderColor="border-divider" borderWidth="1" borderRadius="medium" padding="6">
        <VStack gap="2">
            <BodyShort>{tittel}</BodyShort>
            <Heading level="3" size="large">
                {verdi}
            </Heading>
            {beskrivelse && <BodyShort size="small">{beskrivelse}</BodyShort>}
        </VStack>
    </Box>
);

export default StønadstatistikkPanel;
