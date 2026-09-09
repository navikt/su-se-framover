import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyShort, Box, ExpansionCard, Heading, HGrid, Select, Table, VStack } from '@navikt/ds-react';
import { useMemo, useState } from 'react';

import { MonthPicker } from '~src/components/inputs/datePicker/DatePicker';
import { StønadStatistikkResponse } from '~src/types/Statistikk';
import { formatMonthYear, toIsoMonth } from '~src/utils/date/dateUtils';

import styles from './statistikk.module.less';
import { filtrerStønad, summer } from './statistikkUtils';
import { useStønadstatistikk } from './useStatistikk';

const diagramfarger = [
    styles.diagramfarge1,
    styles.diagramfarge2,
    styles.diagramfarge3,
    styles.diagramfarge4,
    styles.diagramfarge5,
    styles.diagramfarge6,
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
    const status = useStønadstatistikk({ fraOgMed: forrigeMåned(fraOgMed), tilOgMed });

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

    const forrigeMånedsAntall = filtrertDataMedSammenligningsmåned
        ? summer(
              filtrertDataMedSammenligningsmåned.perioder
                  .find((periode) => periode.måned === forrigeMåned(tilOgMed))
                  ?.rader.map((rad) => rad.antall) ?? [],
          )
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
                            onChange={(dato) => {
                                if (dato) setFraOgMed(toIsoMonth(dato));
                            }}
                        />
                        <MonthPicker
                            label="Til og med måned"
                            value={førsteDagIMåned(tilOgMed)}
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
                {RemoteData.isPending(status)
                    ? 'Henter stønadsstatistikk.'
                    : data
                      ? `Viser ${data.perioder.length} måneder.`
                      : RemoteData.isFailure(status)
                        ? 'Stønadsstatistikken kunne ikke hentes.'
                        : null}
            </div>
            {RemoteData.isPending(status) && <Alert variant="info">Henter stønadsstatistikk.</Alert>}
            {RemoteData.isFailure(status) && (
                <Alert variant="error">
                    {status.error.statusCode === 400
                        ? 'Kontroller valgt periode.'
                        : 'Stønadsstatistikken kunne ikke hentes.'}
                </Alert>
            )}
            {data &&
                (data.perioder.every((periode) => periode.rader.length === 0) ? (
                    <Alert variant="info">Ingen statistikk for valgt periode.</Alert>
                ) : (
                    <StønadstatistikkInnhold
                        data={data}
                        forrigeMånedsAntall={forrigeMånedsAntall}
                        erHittilIÅr={periodevalg === 'HITTIL_I_ÅR'}
                    />
                ))}
        </VStack>
    );
};

const StønadstatistikkInnhold = ({
    data,
    forrigeMånedsAntall,
    erHittilIÅr,
}: {
    data: StønadStatistikkResponse;
    forrigeMånedsAntall: number | null;
    erHittilIÅr: boolean;
}) => {
    const perMåned = månederIPeriode(data.fraOgMed, data.tilOgMed).map((måned) => ({
        måned,
        antall: summer(data.perioder.find((periode) => periode.måned === måned)?.rader.map((rad) => rad.antall) ?? []),
    }));
    const siste = perMåned.find((periode) => periode.måned === data.tilOgMed) ?? {
        måned: data.tilOgMed,
        antall: 0,
    };
    const endring =
        forrigeMånedsAntall !== null && forrigeMånedsAntall !== 0
            ? ((siste.antall - forrigeMånedsAntall) / forrigeMånedsAntall) * 100
            : null;
    const sumMånedsforekomster = summer(perMåned.map((periode) => periode.antall));
    const forrigeKalendermåned = forrigeMåned(data.tilOgMed);
    const resultater = [
        ...new Set(data.perioder.flatMap((periode) => periode.rader.map((rad) => rad.vedtaksresultat))),
    ].sort();
    const resultatperioder = data.perioder.map((periode) => ({
        måned: periode.måned,
        grupper: resultater.map((resultat) => ({
            resultat,
            antall: summer(periode.rader.filter((rad) => rad.vedtaksresultat === resultat).map((rad) => rad.antall)),
        })),
    }));
    const sisteResultatperiode = resultatperioder.at(-1);
    const størsteResultat = Math.max(1, ...(sisteResultatperiode?.grupper.map((gruppe) => gruppe.antall) ?? []));

    return (
        <VStack gap={{ xs: '6', md: '8' }}>
            <HGrid columns={{ xs: 1, sm: 3 }} gap={{ xs: '4', md: '6' }}>
                <Oppsummeringskort
                    tittel={formatMonthYear(førsteDagIMåned(siste.måned))}
                    verdi={siste.antall.toLocaleString('nb-NO')}
                />
                <Oppsummeringskort
                    tittel={`Endring fra ${formatMonthYear(førsteDagIMåned(forrigeKalendermåned))}`}
                    verdi={endring === null ? 'Ikke nok data' : `${endring >= 0 ? '+' : ''}${endring.toFixed(1)} %`}
                />
                <Oppsummeringskort
                    tittel={erHittilIÅr ? 'Månedsforekomster hittil i år' : 'Månedsforekomster i perioden'}
                    verdi={sumMånedsforekomster.toLocaleString('nb-NO')}
                />
            </HGrid>
            <BodyShort>
                Summen av månedsforekomster teller en sak én gang for hver måned den har stønad. Den viser ikke antall
                unike saker eller personer.
            </BodyShort>

            <Månedsutvikling perioder={perMåned} />

            <section aria-labelledby="stønad-per-måned">
                <VStack gap="4">
                    <Heading id="stønad-per-måned" level="3" size="medium">
                        Vedtaksresultat
                    </Heading>
                    <BodyShort>Antall per vedtaksresultat i siste måned.</BodyShort>
                    {sisteResultatperiode && (
                        <div className={styles.periodegruppe} aria-hidden="true">
                            <Heading level="4" size="small">
                                {formatMonthYear(førsteDagIMåned(sisteResultatperiode.måned))}
                            </Heading>
                            {sisteResultatperiode.grupper.some((gruppe) => gruppe.antall > 0) ? (
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
                                <BodyShort>Ingen data i måneden.</BodyShort>
                            )}
                        </div>
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
                                        {data.perioder.map((periode) => (
                                            <Table.Row key={periode.måned}>
                                                <Table.DataCell>
                                                    {formatMonthYear(førsteDagIMåned(periode.måned))}
                                                </Table.DataCell>
                                                {resultater.map((resultat) => (
                                                    <Table.DataCell key={resultat} align="right">
                                                        {summer(
                                                            periode.rader
                                                                .filter((rad) => rad.vedtaksresultat === resultat)
                                                                .map((rad) => rad.antall),
                                                        )}
                                                    </Table.DataCell>
                                                ))}
                                                <Table.DataCell align="right">
                                                    {summer(periode.rader.map((rad) => rad.antall))}
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
            <Stønadsklassifisering data={data} />
        </VStack>
    );
};

const Månedsutvikling = ({ perioder }: { perioder: { måned: string; antall: number }[] }) => {
    const maksimum = Math.max(1, ...perioder.map((periode) => periode.antall));

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
                                <strong>{periode.antall.toLocaleString('nb-NO')}</strong>
                                <span className={styles.månedsSøyleområde}>
                                    <span
                                        className={`${styles.månedsSøylefyll} ${styles.diagramfarge1}`}
                                        style={{ height: `${(periode.antall / maksimum) * 100}%` }}
                                    />
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
                                            <Table.DataCell align="right">{periode.antall}</Table.DataCell>
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
    const perioder = data.perioder.map((periode) => ({
        måned: periode.måned,
        grupper: klassifiseringer.map((klassifisering) => ({
            klassifisering,
            antall: summer(
                periode.rader
                    .filter((rad) => (rad.stønadsklassifisering ?? 'IKKE_KLASSIFISERT') === klassifisering)
                    .map((rad) => rad.antall),
            ),
        })),
    }));
    const sistePeriode = perioder.at(-1);
    const maksimum = Math.max(1, ...(sistePeriode?.grupper.map((gruppe) => gruppe.antall) ?? []));

    return (
        <section aria-labelledby="stønadsklassifisering-tittel">
            <VStack gap="4">
                <div>
                    <Heading id="stønadsklassifisering-tittel" level="3" size="medium">
                        Stønadsklassifisering
                    </Heading>
                    <BodyShort>
                        Antall per klassifisering i siste måned. Den samme saken kan inngå i flere måneder, så månedene
                        summeres ikke.
                    </BodyShort>
                </div>
                {sistePeriode && (
                    <div className={styles.periodegruppe} aria-hidden="true">
                        <Heading level="4" size="small">
                            {formatMonthYear(førsteDagIMåned(sistePeriode.måned))}
                        </Heading>
                        {sistePeriode.grupper.some((gruppe) => gruppe.antall > 0) ? (
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
                            <BodyShort>Ingen data i måneden.</BodyShort>
                        )}
                    </div>
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
                                            {periode.grupper.map((gruppe) => (
                                                <Table.DataCell key={gruppe.klassifisering} align="right">
                                                    {gruppe.antall}
                                                </Table.DataCell>
                                            ))}
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

const Oppsummeringskort = ({ tittel, verdi }: { tittel: string; verdi: string }) => (
    <Box background="surface-default" borderColor="border-divider" borderWidth="1" borderRadius="medium" padding="6">
        <BodyShort>{tittel}</BodyShort>
        <Heading level="3" size="large">
            {verdi}
        </Heading>
    </Box>
);

export default StønadstatistikkPanel;
