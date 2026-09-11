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

import { omgjøringsgrunnerTekstMapper } from '~src/components/forms/revurdering/Omgjøringgrunner-nb';
import { DatePicker } from '~src/components/inputs/datePicker/DatePicker';
import {
    Behandlingstidsmåling,
    Beholdningsaldersintervall,
    Beholdningsaldersmåling,
    SakStatistikkKategori,
    SakStatistikkKohort,
    SakStatistikkLov,
    SakStatistikkOmarbeid,
    SakStatistikkParagraf,
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
    if (måling === 'SAKSBEHANDLING_FØR_ATTESTERING') return 'Saksbehandling før attestering';
    return 'Tid per underkjenning → ny attestering';
};

const målingsforklaring = (måling: Behandlingstidsmåling, kategori: SakStatistikkKategori): string => {
    if (måling === 'TOTAL_BEHANDLINGSTID') {
        return kategori === 'KLAGE'
            ? 'Tiden fra klagen ble mottatt til den først ble iverksatt, avsluttet, avbrutt eller oversendt fra førsteinstansen.'
            : 'Tiden fra behandlingen ble mottatt til den først ble iverksatt, avsluttet eller avbrutt.';
    }
    if (måling === 'SAKSBEHANDLING_FØR_ATTESTERING') {
        return 'Tiden i det siste sammenhengende saksbehandlingssteget før behandlingen ble sendt til attestering. Steget kan starte i «Under behandling».';
    }
    if (måling === 'TID_HOS_ATTESTANT') {
        return 'Tiden fra behandlingen ble sendt til attestering til den ble iverksatt eller underkjent.';
    }
    return 'Tiden for én overgang fra underkjenning til behandlingen ble sendt til attestering på nytt. En behandling kan bidra med flere målinger.';
};

const egendefinertKodetekst: Record<string, string> = {
    OMGJORING_ETTER_AVSLAG: 'Ny behandling av tidligere avslag',
    OMGJORING_ETTER_AVVIST: 'Ny behandling av tidligere avslag',
    SUALDER: 'Alder',
    SUUFORE: 'Uføre',
    SU_ALDER: 'Alder',
    SU_UFØR: 'Uføre',
    UFØRHET: 'Uførevilkåret er ikke oppfylt',
    FLYKTNING: 'Flyktningvilkåret er ikke oppfylt',
    OPPHOLDSTILLATELSE: 'Kravet til oppholdstillatelse er ikke oppfylt',
    PERSONLIG_OPPMØTE: 'Kravet til personlig oppmøte er ikke oppfylt',
    FORMUE: 'Formuen er for høy',
    BOR_OG_OPPHOLDER_SEG_I_NORGE: 'Kravet om å bo og oppholde seg i Norge er ikke oppfylt',
    FOR_HØY_INNTEKT: 'Inntekten er for høy',
    SU_UNDER_MINSTEGRENSE: 'Beregnet stønad er under minstegrensen',
    UTENLANDSOPPHOLD_OVER_90_DAGER: 'Utenlandsopphold over 90 dager',
    UTENLANDSOPPHOLD: 'Utenlandsopphold',
    INNLAGT_PÅ_INSTITUSJON: 'Institusjonsopphold',
    MANGLENDE_DOKUMENTASJON: 'Manglende dokumentasjon',
    SØKNAD_MANGLER_DOKUMENTASJON: 'Søknaden mangler dokumentasjon',
    ALDERSPENSJON_FOLKETRYGDEN: 'Det er ikke søkt alderspensjon fra folketrygden',
    ALDERSPENSJON_ANDRE_NORSKE_PENSJONSORDNINGER: 'Det er ikke søkt andre norske pensjoner',
    ALDERSPENSJON_UTENLANDSKE_PENSJONSORDNINGER: 'Det er ikke søkt utenlandske pensjoner',
    ALDERSPENSJON: 'Det er ikke søkt alderspensjon',
    FAMILIEGJENFORENING: 'Vilkåret knyttet til familiegjenforening er ikke oppfylt',
    FOR_TIDLIG_SØKNAD: 'Søknaden ble sendt for tidlig',
    IKKE_INNENFOR_FRISTEN: 'Klagen ble sendt etter fristen',
    KLAGES_IKKE_PÅ_KONKRETE_ELEMENTER_I_VEDTAKET: 'Klagen gjelder ikke konkrete deler av vedtaket',
    IKKE_UNDERSKREVET: 'Klagen er ikke underskrevet',
    ...omgjøringsgrunnerTekstMapper,
};

const tekstFraKode = (verdi: string): string => {
    if (egendefinertKodetekst[verdi]) return egendefinertKodetekst[verdi];

    const småBokstaver = verdi.replaceAll('_', ' ').toLocaleLowerCase('nb-NO');
    return småBokstaver.charAt(0).toLocaleUpperCase('nb-NO') + småBokstaver.slice(1);
};

const formaterDager = (dager: number): string =>
    new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(dager);

const formaterProsent = (prosent: number): string =>
    new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(prosent);

const formaterVarighet = (dager: number): string => {
    if (dager === 0) return '0 minutter';

    const minutter = dager * 24 * 60;
    if (minutter < 1) return '< 1 minutt';
    if (minutter < 60) {
        const avrundet = Math.round(minutter);
        return `${avrundet.toLocaleString('nb-NO')} ${avrundet === 1 ? 'minutt' : 'minutter'}`;
    }

    const timer = minutter / 60;
    if (timer < 24) {
        const avrundet = Math.round(timer * 10) / 10;
        return `${avrundet.toLocaleString('nb-NO')} ${avrundet === 1 ? 'time' : 'timer'}`;
    }

    return `${formaterDager(dager)} dager`;
};

const formaterPeriode = (fraOgMed: string, tilOgMed: string): string =>
    `${formatDate(parseNonNullableIsoDateOnly(fraOgMed))}–${formatDate(parseNonNullableIsoDateOnly(tilOgMed))}`;

const formaterDelperiode = (fraOgMed: string, tilOgMed: string, oppløsning: Statistikkoppløsning): string => {
    if (oppløsning !== 'ÅR') return formaterPeriode(fraOgMed, tilOgMed);

    const fra = parseNonNullableIsoDateOnly(fraOgMed);
    const til = parseNonNullableIsoDateOnly(tilOgMed);
    if (fra.getFullYear() !== til.getFullYear()) return formaterPeriode(fraOgMed, tilOgMed);

    const år = fra.getFullYear();
    const starterFørsteJanuar = fra.getMonth() === 0 && fra.getDate() === 1;
    const slutterSisteDesember = til.getMonth() === 11 && til.getDate() === 31;
    if (starterFørsteJanuar && slutterSisteDesember) return String(år);
    if (starterFørsteJanuar) return `${år} (til ${formatDate(tilOgMed)})`;
    if (slutterSisteDesember) return `${år} (fra ${formatDate(fraOgMed)})`;
    return `${år} (${formaterPeriode(fraOgMed, tilOgMed)})`;
};

const forskyvÅr = (dato: string, antall: number): Date => {
    const resultat = parseNonNullableIsoDateOnly(dato);
    resultat.setFullYear(resultat.getFullYear() + antall);
    return resultat;
};

const dekkerMinstTolvMåneder = (fraOgMed: string, tilOgMed: string): boolean => {
    const fra = parseNonNullableIsoDateOnly(fraOgMed);
    const førsteTillatteSluttdato = new Date(fra.getFullYear() + 1, fra.getMonth(), fra.getDate());
    førsteTillatteSluttdato.setDate(førsteTillatteSluttdato.getDate() - 1);
    return parseNonNullableIsoDateOnly(tilOgMed) >= førsteTillatteSluttdato;
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
    const kanVelgeÅrsoppløsning = dekkerMinstTolvMåneder(fraOgMed, tilOgMed);

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
                            const nyFraOgMed = toIsoDateOnlyString(dato);
                            if (nyFraOgMed === fraOgMed) return;
                            setPeriodevalg('EGENDEFINERT');
                            setFraOgMed(nyFraOgMed);
                            if (oppløsning === 'ÅR' && !dekkerMinstTolvMåneder(nyFraOgMed, tilOgMed)) {
                                setOppløsning('MÅNED');
                            }
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
                            const nyTilOgMed = toIsoDateOnlyString(dato);
                            if (nyTilOgMed === tilOgMed) return;
                            setPeriodevalg('EGENDEFINERT');
                            setTilOgMed(nyTilOgMed);
                            if (oppløsning === 'ÅR' && !dekkerMinstTolvMåneder(fraOgMed, nyTilOgMed)) {
                                setOppløsning('MÅNED');
                            }
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
                        <option value="ÅR" disabled={!kanVelgeÅrsoppløsning}>
                            År{kanVelgeÅrsoppløsning ? '' : ' (krever minst 12 måneder)'}
                        </option>
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
                <SakstatistikkInnhold key={kategori} data={status.value} kategori={kategori} ytelse={ytelse} />
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
        (kohort) =>
            kohort.behandlingskategori === props.kategori &&
            (props.ytelse === null || kohort.sakYtelse === props.ytelse),
    );
    const harPeriodedata = harSakstatistikk(perioder);
    const totalBehandlingstidSerier = useMemo(
        () => lagBehandlingstidSerier(perioder, props.kategori, props.ytelse, 'TOTAL_BEHANDLINGSTID'),
        [perioder, props.kategori, props.ytelse],
    );
    const harTotalBehandlingstid = totalBehandlingstidSerier.some((serie) =>
        serie.punkter.some((punkt) => punkt.antall > 0),
    );
    const kohortvisning = (
        <Kohorter kohorter={kohorter} rapportFraOgMed={props.data.fraOgMed} rapportdato={props.data.tilOgMed} />
    );

    return (
        <VStack gap={{ xs: '6', md: '8' }}>
            {!harPeriodedata && kohorter.length === 0 ? (
                <Alert variant="info">Ingen statistikk for valgt periode.</Alert>
            ) : (
                <>
                    {harPeriodedata && (
                        <>
                            {props.data.oppløsning === 'ÅR' && props.data.perioder.length > 1 && (
                                <Alert variant="info">
                                    Årsperiodene kan dekke ulike deler av kalenderårene. Ta hensyn til hvor mange
                                    måneder hver delperiode dekker når du sammenligner antall.
                                </Alert>
                            )}
                            {props.data.metadata.sisteHendelseTidspunkt && (
                                <BodyShort size="small">
                                    Siste registrerte hendelse i datagrunnlaget:{' '}
                                    {formatDateTime(props.data.metadata.sisteHendelseTidspunkt)}
                                </BodyShort>
                            )}
                            <StatistikkortGrid perioder={perioder} kategori={props.kategori} ytelse={props.ytelse} />
                            {kohortvisning}
                            <BehandlingstidKortGrid
                                perioder={props.data.perioder}
                                kategori={props.kategori}
                                ytelse={props.ytelse}
                            />
                            {harTotalBehandlingstid && (
                                <BehandlingstidDiagram
                                    key={`${props.kategori}-${props.ytelse ?? 'ALLE'}`}
                                    serier={totalBehandlingstidSerier}
                                    kategori={props.kategori}
                                    måling="TOTAL_BEHANDLINGSTID"
                                    fraOgMed={props.data.fraOgMed}
                                    tilOgMed={props.data.tilOgMed}
                                />
                            )}
                            <AntallDiagram
                                perioder={perioder}
                                kategori={props.kategori}
                                oppløsning={props.data.oppløsning}
                            />
                            <UtfallDiagram perioder={perioder} oppløsning={props.data.oppløsning} />
                            <Utfallsfordelinger
                                perioder={perioder}
                                kategori={props.kategori}
                                oppløsning={props.data.oppløsning}
                            />
                            <BeholdningDiagram perioder={perioder} oppløsning={props.data.oppløsning} />
                            <Beholdningsalder perioder={perioder} />
                            <Omarbeid perioder={perioder} kategori={props.kategori} />
                        </>
                    )}
                    {!harPeriodedata && kohortvisning}
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
            tittel: 'Ferdigbehandlede behandlinger i perioden',
            verdi: summer(props.perioder.flatMap((periode) => periode.utfall.map((rad) => rad.antall))).toLocaleString(
                'nb-NO',
            ),
            detaljer: 'Behandlinger som fikk sin første avsluttende hendelse i hele perioden.',
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
                        Oversikt for valgt periode
                    </Heading>
                    <BodyShort>
                        {tekstFraKode(props.kategori)}, {props.ytelse ? tekstFraKode(props.ytelse) : 'alle ytelser'}
                    </BodyShort>
                    <BodyShort size="small">
                        Kortene måler ulike ting og skal ikke trekkes fra hverandre. Registrerte behandlinger telles på
                        registreringsdatoen. Kohortene grupperes etter mottaksdatoen, som kan være en annen dato.
                        Tallene kan derfor avvike. Ferdigbehandlede behandlinger telles ved første avsluttende hendelse,
                        og beholdningen er et øyeblikksbilde på sluttdatoen.
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
                        Kortene viser et antallsvektet gjennomsnitt for hele perioden. Målingene gjelder ulike grupper
                        behandlinger og skal ikke summeres. Ytelsene holdes adskilt.
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
                                                {gjennomsnitt === null ? 'Ingen data' : formaterVarighet(gjennomsnitt)}
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
    const [aktivtPunktNøkkel, setAktivtPunktNøkkel] = useState<{ ytelse: string; periode: string } | null>(null);
    const aktivSerie = props.serier.find((serie) => serie.ytelse === aktivtPunktNøkkel?.ytelse);
    const aktivtPunkt = aktivSerie?.punkter.find((punkt) => punkt.periode === aktivtPunktNøkkel?.periode);
    const allePunkter = props.serier.flatMap((serie) => serie.punkter);
    const aksePunkter = props.serier[0]?.punkter ?? [];
    const maks = Math.max(1, ...allePunkter.map((punkt) => punkt.gjennomsnittDager ?? 0));
    const bredde = 900;
    const høyde = 260;
    const padding = 36;
    const antallPerioder = Math.max(allePunkter.length > 0 ? props.serier[0].punkter.length : 0, 2);
    const x = (indeks: number) => padding + (indeks * (bredde - padding * 2)) / (antallPerioder - 1);
    const y = (verdi: number) => høyde - padding - (verdi / maks) * (høyde - padding * 2);
    const farger = ['var(--a-blue-600)', 'var(--a-purple-600)', 'var(--a-orange-600)', 'var(--a-green-600)'];
    const erUkeserie = aksePunkter.every((punkt) => {
        const fra = parseNonNullableIsoDateOnly(punkt.periode);
        const til = parseNonNullableIsoDateOnly(punkt.periodeTilOgMed);
        return til.getTime() - fra.getTime() <= 7 * MILLIS_PER_DAY;
    });
    const erMånedsserie =
        !erUkeserie &&
        aksePunkter.every((punkt) => {
            const fra = parseNonNullableIsoDateOnly(punkt.periode);
            const til = parseNonNullableIsoDateOnly(punkt.periodeTilOgMed);
            return fra.getFullYear() === til.getFullYear() && fra.getMonth() === til.getMonth();
        });
    const formaterAkseetikett = (punkt: BehandlingstidPunkt): string => {
        const fra = parseNonNullableIsoDateOnly(punkt.periode);
        if (erMånedsserie) {
            return new Intl.DateTimeFormat('nb-NO', { month: 'short', year: '2-digit' }).format(fra);
        }
        if (erUkeserie) {
            return new Intl.DateTimeFormat('nb-NO', { day: '2-digit', month: '2-digit' }).format(fra);
        }
        return String(fra.getFullYear());
    };

    const segmenter = (punkter: BehandlingstidPunkt[]): string[] => {
        const resultat: string[] = [];
        let segment = '';
        punkter.forEach((punkt, indeks) => {
            const verdi = punkt.gjennomsnittDager;
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
                        <BodyShort as="span">{målingsforklaring(props.måling, props.kategori)} </BodyShort>
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
                                    Gjennomsnittlig behandlingstid. Alle verdiene finnes i tabellen under diagrammet.
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
                                    {formaterVarighet(maks)}
                                </text>
                                {aksePunkter.map((punkt, indeks) => (
                                    <text
                                        key={punkt.periode}
                                        x={x(indeks)}
                                        y={høyde - 10}
                                        textAnchor="middle"
                                        className={styles.aksetekst}
                                    >
                                        {formaterAkseetikett(punkt)}
                                    </text>
                                ))}
                                {props.serier.map((serie, serieindeks) => (
                                    <g key={serie.ytelse}>
                                        {segmenter(serie.punkter).map((punkter) => (
                                            <polyline
                                                key={punkter}
                                                points={punkter}
                                                fill="none"
                                                stroke={farger[serieindeks % farger.length]}
                                                strokeWidth="4"
                                            />
                                        ))}
                                        {serie.punkter.map((punkt, indeks) =>
                                            punkt.gjennomsnittDager === null ? null : (
                                                <circle
                                                    key={`${serie.ytelse}-${punkt.periode}`}
                                                    cx={x(indeks)}
                                                    cy={y(punkt.gjennomsnittDager)}
                                                    r="7"
                                                    fill={farger[serieindeks % farger.length]}
                                                    className={styles.diagrampunkt}
                                                    tabIndex={0}
                                                    role="button"
                                                    aria-label={`${tekstFraKode(serie.ytelse)}, ${formaterPeriode(punkt.periode, punkt.periodeTilOgMed)}. Gjennomsnitt ${formaterVarighet(punkt.gjennomsnittDager)}. Vis detaljer.`}
                                                    onFocus={() =>
                                                        setAktivtPunktNøkkel({
                                                            ytelse: serie.ytelse,
                                                            periode: punkt.periode,
                                                        })
                                                    }
                                                    onMouseEnter={() =>
                                                        setAktivtPunktNøkkel({
                                                            ytelse: serie.ytelse,
                                                            periode: punkt.periode,
                                                        })
                                                    }
                                                />
                                            ),
                                        )}
                                    </g>
                                ))}
                            </svg>
                        </div>
                        <div className={styles.forklaring}>
                            <span className={styles.linjeforklaring}>
                                <svg className={styles.linjeprøve} viewBox="0 0 32 8" aria-hidden="true">
                                    <line x1="0" y1="4" x2="32" y2="4" />
                                </svg>
                                Gjennomsnitt
                            </span>
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
                            {aktivSerie && aktivtPunkt ? (
                                <>
                                    <strong>
                                        {tekstFraKode(aktivSerie.ytelse)},{' '}
                                        {formaterPeriode(aktivtPunkt.periode, aktivtPunkt.periodeTilOgMed)}
                                    </strong>
                                    <span>Gjennomsnitt: {formaterVarighet(aktivtPunkt.gjennomsnittDager ?? 0)}</span>
                                    <span>
                                        {props.måling === 'TOTAL_BEHANDLINGSTID'
                                            ? 'Antall behandlinger'
                                            : 'Antall målinger'}
                                        : {aktivtPunkt.antall}
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
                                        {punkt.gjennomsnittDager === null
                                            ? 'Ingen data'
                                            : formaterVarighet(punkt.gjennomsnittDager)}
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
    BEHANDLINGENS_ALDER: 'Liggetid siden behandlingen ble mottatt',
    TID_I_NÅVÆRENDE_STATUS: 'Tid siden behandlingen fikk nåværende status',
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
    const sistePeriode = perioder.at(-1);
    if (!sistePeriode || perioderMedData.length === 0) return null;
    const tidligerePerioder = perioderMedData.filter((periode) => periode !== sistePeriode).reverse();

    const summerAldersmåling = (
        periode: SakStatistikkPeriode,
        måling: Beholdningsaldersmåling,
        intervall?: Beholdningsaldersintervall,
    ): number =>
        summer(
            periode.beholdningsalder
                .filter((rad) => rad.måling === måling && (intervall === undefined || rad.intervall === intervall))
                .map((rad) => rad.antall),
        );

    return (
        <section aria-labelledby="beholdningsalder-tittel">
            <VStack gap="4">
                <div>
                    <Heading id="beholdningsalder-tittel" level="3" size="medium">
                        Liggetid for behandlinger i restanse
                    </Heading>
                    <BodyShort>
                        En behandling i restanse er mottatt, men ikke avsluttet. Liggetiden er antall dager fra
                        behandlingen ble mottatt til slutten av rapporteringsperioden. Den første tabellen fordeler
                        behandlingene etter liggetid. Den andre viser hvor lenge behandlingen har hatt statusen som står
                        i raden. En behandling kan derfor ha en liggetid på over 90 dager, men bare ha vært «Underkjent»
                        i 31–60 dager. For «Registrert» er målingene vanligvis like fordi behandlingen ennå ikke har
                        fått en ny status. Det betyr ikke nødvendigvis at ingen har arbeidet med behandlingen. Tabellen
                        viser restansen ved slutten av siste delperiode. Periodene summeres ikke.
                    </BodyShort>
                </div>
                <Alert variant="info">
                    <VStack gap="2">
                        <Label>Slik leser du tabellene</Label>
                        <BodyShort>
                            Hver periode er et historisk øyeblikksbilde ved periodens slutt. En behandling som ble
                            mottatt 1. januar, og fikk en ny status 10. februar, kan ha 30 dagers liggetid og 30 dager i
                            «Registrert» 31. januar. Den 28. februar kan den ha 58 dagers liggetid og 18 dager i den nye
                            statusen. Når behandlingen får en avsluttende status, inngår den ikke i senere målinger av
                            restansen. Sammenligning av periodene viser hvordan liggetidsfordelingen i restansen
                            utvikler seg. Den følger ikke hver enkelt behandling; det gjør kohortvisningen.
                        </BodyShort>
                    </VStack>
                </Alert>
                <Heading level="4" size="small">
                    {formaterPeriode(sistePeriode.fraOgMed, sistePeriode.tilOgMed)}
                </Heading>
                {sistePeriode.beholdningsalder.length === 0 ? (
                    <Alert variant="info">Ingen liggetidsfordeling for restansen i denne perioden.</Alert>
                ) : (
                    (Object.keys(aldersmålingstekst) as Beholdningsaldersmåling[]).map((måling) => (
                        <VStack key={måling} gap="3">
                            <Heading level="5" size="xsmall">
                                {aldersmålingstekst[måling]}
                            </Heading>
                            <Alderstabell periode={sistePeriode} måling={måling} />
                        </VStack>
                    ))
                )}
                {tidligerePerioder.length > 0 && (
                    <ExpansionCard aria-label="Liggetid for tidligere perioder">
                        <ExpansionCard.Header>
                            <ExpansionCard.Title as="h4" size="small">
                                Vis utvikling i tidligere perioder
                            </ExpansionCard.Title>
                            <ExpansionCard.Description>
                                Tabellen summerer alle statuser og valgte ytelser.
                            </ExpansionCard.Description>
                        </ExpansionCard.Header>
                        <ExpansionCard.Content>
                            <div className={styles.tabellRamme}>
                                <Table size="small">
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>Periode</Table.HeaderCell>
                                            <Table.HeaderCell align="right">Behandlinger i restanse</Table.HeaderCell>
                                            <Table.HeaderCell align="right">Liggetid over 90 dager</Table.HeaderCell>
                                            <Table.HeaderCell align="right">
                                                Over 90 dager i samme status
                                            </Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {tidligerePerioder.map((periode) => (
                                            <Table.Row key={periode.fraOgMed}>
                                                <Table.DataCell>
                                                    {formaterPeriode(periode.fraOgMed, periode.tilOgMed)}
                                                </Table.DataCell>
                                                <Table.DataCell align="right">
                                                    {summerAldersmåling(periode, 'BEHANDLINGENS_ALDER')}
                                                </Table.DataCell>
                                                <Table.DataCell align="right">
                                                    {summerAldersmåling(
                                                        periode,
                                                        'BEHANDLINGENS_ALDER',
                                                        'OVER_90_DAGER',
                                                    )}
                                                </Table.DataCell>
                                                <Table.DataCell align="right">
                                                    {summerAldersmåling(
                                                        periode,
                                                        'TID_I_NÅVÆRENDE_STATUS',
                                                        'OVER_90_DAGER',
                                                    )}
                                                </Table.DataCell>
                                            </Table.Row>
                                        ))}
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

type Omarbeidsoppsummering = Pick<
    SakStatistikkOmarbeid,
    'sakYtelse' | 'behandlingerMedUtfall' | 'utenUnderkjenning' | 'medEnUnderkjenning' | 'medFlereUnderkjenninger'
>;

const Omarbeidskort = ({
    rad,
    visUnderkjenningsandel,
}: {
    rad: Omarbeidsoppsummering;
    visUnderkjenningsandel: boolean;
}) => {
    const underkjente = rad.medEnUnderkjenning + rad.medFlereUnderkjenninger;
    const andel = rad.behandlingerMedUtfall === 0 ? null : (underkjente / rad.behandlingerMedUtfall) * 100;

    return (
        <VStack gap="3">
            <div>
                <Heading level="4" size="small">
                    {tekstFraKode(rad.sakYtelse)}
                </Heading>
                <BodyShort size="small">{rad.behandlingerMedUtfall} ferdigbehandlede behandlinger</BodyShort>
            </div>
            <HGrid columns={{ xs: 1, sm: 2, lg: visUnderkjenningsandel ? 4 : 3 }} gap="4">
                {visUnderkjenningsandel && (
                    <Oppsummeringsboks
                        tittel="Underkjenningsandel"
                        verdi={andel === null ? 'Ingen data' : `${formaterProsent(andel)} %`}
                        detaljer={`${underkjente.toLocaleString('nb-NO')} av ${rad.behandlingerMedUtfall.toLocaleString('nb-NO')} hadde minst én underkjenning.`}
                    />
                )}
                <Oppsummeringsboks tittel="Uten underkjenning" verdi={rad.utenUnderkjenning.toLocaleString('nb-NO')} />
                <Oppsummeringsboks tittel="Én underkjenning" verdi={rad.medEnUnderkjenning.toLocaleString('nb-NO')} />
                <Oppsummeringsboks
                    tittel="Flere underkjenninger"
                    verdi={rad.medFlereUnderkjenninger.toLocaleString('nb-NO')}
                />
            </HGrid>
        </VStack>
    );
};

const Oppsummeringsboks = ({ tittel, verdi, detaljer }: { tittel: string; verdi: string; detaljer?: string }) => (
    <Box background="surface-default" borderColor="border-divider" borderWidth="1" borderRadius="medium" padding="5">
        <VStack gap="2">
            <Label>{tittel}</Label>
            <Heading level="5" size="medium">
                {verdi}
            </Heading>
            {detaljer && <BodyShort size="small">{detaljer}</BodyShort>}
        </VStack>
    </Box>
);

const Omarbeid = ({ perioder, kategori }: { perioder: SakStatistikkPeriode[]; kategori: SakStatistikkKategori }) => {
    const perioderMedData = perioder.filter((periode) => periode.omarbeid.length > 0);
    if (perioderMedData.length === 0) return null;
    const summertePerYtelse = new Map<string, Omarbeidsoppsummering>();
    perioderMedData.forEach((periode) => {
        periode.omarbeid.forEach((rad) => {
            const eksisterende = summertePerYtelse.get(rad.sakYtelse);
            summertePerYtelse.set(rad.sakYtelse, {
                sakYtelse: rad.sakYtelse,
                behandlingerMedUtfall: (eksisterende?.behandlingerMedUtfall ?? 0) + rad.behandlingerMedUtfall,
                utenUnderkjenning: (eksisterende?.utenUnderkjenning ?? 0) + rad.utenUnderkjenning,
                medEnUnderkjenning: (eksisterende?.medEnUnderkjenning ?? 0) + rad.medEnUnderkjenning,
                medFlereUnderkjenninger: (eksisterende?.medFlereUnderkjenninger ?? 0) + rad.medFlereUnderkjenninger,
            });
        });
    });
    const visUnderkjenningsandel = kategori === 'SØKNAD' || kategori === 'REVURDERING';

    return (
        <section aria-labelledby="omarbeid-tittel">
            <VStack gap="4">
                <div>
                    <Heading id="omarbeid-tittel" level="3" size="medium">
                        Omarbeid etter underkjenning
                    </Heading>
                    <BodyShort>
                        Behandlinger som ble ferdige i perioden, fordelt etter om de ble underkjent null, én eller flere
                        ganger. Oppsummeringen gjelder hele den valgte perioden.
                    </BodyShort>
                </div>
                {[...summertePerYtelse.values()]
                    .sort((a, b) => a.sakYtelse.localeCompare(b.sakYtelse, 'nb-NO'))
                    .map((rad) => (
                        <Omarbeidskort key={rad.sakYtelse} rad={rad} visUnderkjenningsandel={visUnderkjenningsandel} />
                    ))}
                {perioderMedData.length > 1 && (
                    <ExpansionCard aria-label="Omarbeid for tidligere perioder">
                        <ExpansionCard.Header>
                            <ExpansionCard.Title as="h4" size="small">
                                Vis periodene hver for seg
                            </ExpansionCard.Title>
                            <ExpansionCard.Description>
                                Perioder uten ferdigbehandlede behandlinger vises ikke.
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
    const prosenttekst = formaterProsent(prosent);
    const manglerOppfølgingstid = kohort.antallStartet - frist.grunnlag;
    const dekning =
        manglerOppfølgingstid > 0
            ? `. ${manglerOppfølgingstid} av ${kohort.antallStartet} har ennå ikke hatt ${dager} dagers oppfølgingstid`
            : '';
    return `${frist.ferdige} av ${frist.grunnlag} (${prosenttekst} %)${dekning}`;
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
                    <Table.HeaderCell align="right">
                        Fortsatt åpne blant behandlingene som ble mottatt i perioden {formatDate(rapportdato)}
                    </Table.HeaderCell>
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

const Kohorter = ({
    kohorter,
    rapportFraOgMed,
    rapportdato,
}: {
    kohorter: SakStatistikkKohort[];
    rapportFraOgMed: string;
    rapportdato: string;
}) => {
    if (kohorter.length === 0) return null;
    const sorterteKohorter = [...kohorter].sort((a, b) => a.fraOgMed.localeCompare(b.fraOgMed));
    const summerteKohorter = summerKohorter(sorterteKohorter).map((kohort) => ({
        ...kohort,
        fraOgMed: rapportFraOgMed,
        tilOgMed: rapportdato,
    }));
    const harFlereMottaksperioder = new Set(sorterteKohorter.map((kohort) => kohort.fraOgMed)).size > 1;

    return (
        <section aria-labelledby="kohorter-tittel">
            <VStack gap="4">
                <div>
                    <Heading id="kohorter-tittel" level="3" size="medium">
                        Behandlinger fulgt fra mottak
                    </Heading>
                    <BodyShort>
                        Behandlinger gruppert etter når de ble mottatt. De følges til første avsluttende hendelse:
                        iverksatt eller avsluttet, og for klager også oversendt. «Avbrutt» er et resultat på en
                        avsluttet behandling, ikke en status. Grunnlaget viser hvor mange som har hatt hele fristen på
                        30, 60 eller 90 dager. Første tabell summerer hele den valgte perioden. Tallene kan avvike fra
                        «Registrerte behandlinger», som grupperes etter registreringsdatoen.
                    </BodyShort>
                </div>
                <Alert variant="info">
                    <VStack gap="2">
                        <Label>Slik leser du tabellen</Label>
                        <BodyShort>
                            Tabellen grupperer behandlingene etter når de ble mottatt. Hvis 80 av 100 behandlinger ble
                            ferdige innen 30 dager, vises «80 av 100 (80 %)». Hvis bare 60 har rukket å få hele
                            90-dagersfristen før rapportdatoen, er grunnlaget for 90 dager 60. De øvrige regnes ikke som
                            forsinket. «Fortsatt åpne» teller bare behandlinger som ble mottatt i den valgte perioden.
                            Beholdningen inkluderer også eldre behandlinger som ble mottatt før periodestart.
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
                        registrerte avsluttende hendelser. Utfallstallene bruker bare den første hendelsen per
                        behandling.
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
    oppløsning: Statistikkoppløsning,
) => {
    const sistePeriode = perioder.at(-1);
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
    const hovedperiode = hovedvisning === 'SUMMER_PERIODEN' ? summertPeriode : sistePeriode;
    const detaljperioder = [...perioder].reverse();
    const maksimum = Math.max(1, ...(hovedperiode?.grupper.map((gruppe) => gruppe.antall) ?? []));
    const fargerekkefølge = [
        ...(hovedperiode?.grupper.map((gruppe) => gruppe.navn) ?? []),
        ...kolonner.filter((kolonne) => !hovedperiode?.grupper.some((gruppe) => gruppe.navn === kolonne)),
    ];
    const visPeriode = (periode: SummertPeriode) => (
        <div className={styles.periodegruppe} key={periode.fraOgMed}>
            <Label>{formaterDelperiode(periode.fraOgMed, periode.tilOgMed, oppløsning)}</Label>
            {periode.grupper.length === 0 ? (
                <BodyShort>Ingen data i perioden.</BodyShort>
            ) : (
                <div className={styles.horisontaleSøyler}>
                    {periode.grupper.map((gruppe) => (
                        <div className={styles.horisontalSøyleRad} key={gruppe.navn}>
                            <span>{gruppe.navn.includes(' / ') ? gruppe.navn : tekstFraKode(gruppe.navn)}</span>
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
                    <div className={styles.søylediagram}>{visPeriode(hovedperiode)}</div>
                ) : (
                    <Alert variant="info">Ingen data i den valgte perioden.</Alert>
                )}
                {detaljperioder.length > 1 && kolonner.length > 0 && (
                    <ExpansionCard
                        aria-label={`${
                            hovedvisning === 'SUMMER_PERIODEN' ? 'Delperioder' : 'Perioder'
                        } for ${tittel.toLocaleLowerCase('nb-NO')}`}
                    >
                        <ExpansionCard.Header>
                            <ExpansionCard.Title as="h4" size="small">
                                {hovedvisning === 'SUMMER_PERIODEN'
                                    ? 'Vis periodene hver for seg'
                                    : 'Vis utviklingen per periode'}
                            </ExpansionCard.Title>
                            <ExpansionCard.Description>
                                Periodene er sortert med den nyeste først.
                            </ExpansionCard.Description>
                        </ExpansionCard.Header>
                        <ExpansionCard.Content>
                            <div className={styles.tabellRamme}>
                                <Table size="small">
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>Periode</Table.HeaderCell>
                                            {kolonner.map((kolonne) => (
                                                <Table.HeaderCell key={kolonne} align="right">
                                                    {kolonne.includes(' / ') ? kolonne : tekstFraKode(kolonne)}
                                                </Table.HeaderCell>
                                            ))}
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {detaljperioder.map((periode) => (
                                            <Table.Row key={periode.fraOgMed}>
                                                <Table.DataCell>
                                                    {formaterDelperiode(periode.fraOgMed, periode.tilOgMed, oppløsning)}
                                                </Table.DataCell>
                                                {periode.grupper.length === 0 ? (
                                                    <Table.DataCell colSpan={Math.max(1, kolonner.length)}>
                                                        Ingen data
                                                    </Table.DataCell>
                                                ) : (
                                                    kolonner.map((kolonne) => (
                                                        <Table.DataCell key={kolonne} align="right">
                                                            {periode.grupper.find((gruppe) => gruppe.navn === kolonne)
                                                                ?.antall ?? 0}
                                                        </Table.DataCell>
                                                    ))
                                                )}
                                            </Table.Row>
                                        ))}
                                        {hovedvisning === 'SUMMER_PERIODEN' && hovedperiode && (
                                            <Table.Row>
                                                <Table.HeaderCell scope="row">Totalt</Table.HeaderCell>
                                                {kolonner.map((kolonne) => (
                                                    <Table.DataCell key={kolonne} align="right">
                                                        {hovedperiode.grupper.find((gruppe) => gruppe.navn === kolonne)
                                                            ?.antall ?? 0}
                                                    </Table.DataCell>
                                                ))}
                                            </Table.Row>
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
            grupper: [...grupper]
                .map(([navn, antall]) => ({ navn, antall }))
                .sort((a, b) => a.navn.localeCompare(b.navn, 'nb-NO')),
        };
    });

const AntallDiagram = ({
    perioder,
    kategori,
    oppløsning,
}: {
    perioder: SakStatistikkPeriode[];
    kategori: SakStatistikkKategori;
    oppløsning: Statistikkoppløsning;
}) => {
    const data = grupperPerPeriode(perioder, (periode) =>
        periode.antall.map((rad) => ({
            navn: rad.behandlingAarsak
                ? `${tekstFraKode(rad.sakYtelse)} / ${tekstFraKode(rad.behandlingAarsak)}`
                : tekstFraKode(rad.sakYtelse),
            antall: rad.antall,
        })),
    );
    const kolonner = [...new Set(data.flatMap((periode) => periode.grupper.map((gruppe) => gruppe.navn)))].sort(
        (a, b) => a.localeCompare(b, 'nb-NO'),
    );
    return stabletDiagram(
        'antall-tittel',
        'Registrerte behandlinger',
        kategori === 'SØKNAD'
            ? 'Behandlinger som ble registrert i perioden. Behandlingsårsaken sier hvorfor behandlingen ble opprettet. «Ny behandling av tidligere avslag» er ikke en ny søknad fra brukeren.'
            : 'Behandlinger som ble registrert i perioden. Behandlingsårsaken sier hvorfor behandlingen ble opprettet. Utfallet vises separat og kan komme i en senere periode.',
        data,
        kolonner,
        'SUMMER_PERIODEN',
        oppløsning,
    );
};

interface Fordelingsrad {
    nøkkel: string;
    kode: string;
    paragrafer: SakStatistikkParagraf[];
    antallBehandlinger: number;
}

interface Fordelingsgruppe {
    nøkkel: string;
    sakYtelse: string;
    resultat: string | null;
    totalt: number;
    rader: Fordelingsrad[];
}

type Fordelingstype = 'AVSLAG' | 'OPPHØR' | 'KLAGEAVVISNING' | 'KLAGEHJEMMEL' | 'KLAGEOMGJØRING';

interface Fordelingsoppsett {
    type: Fordelingstype;
    id: string;
    tittel: string;
    radoverskrift: string;
    totaltekst: string;
}

const lovtekst: Record<SakStatistikkLov, string> = {
    SU: 'SU-loven',
    FVL: 'Forvaltningsloven',
};

const formaterParagrafer = (paragrafer: SakStatistikkParagraf[]): string =>
    paragrafer.length === 0
        ? '–'
        : [...paragrafer]
              .sort((a, b) => a.lov.localeCompare(b.lov) || a.paragraf - b.paragraf)
              .map((paragraf) => `${lovtekst[paragraf.lov]} § ${paragraf.paragraf}`)
              .join(', ');

const leggTilDatakvalitetsrader = (
    rader: Fordelingsrad[],
    antallUtenVerdi: number,
    antallMedUkjentVerdi: number,
    verdi: 'begrunnelse' | 'hjemmel',
): Fordelingsrad[] => [
    ...rader,
    ...(antallUtenVerdi > 0
        ? [
              {
                  nøkkel: 'MANGLER',
                  kode: `Mangler ${verdi}`,
                  paragrafer: [],
                  antallBehandlinger: antallUtenVerdi,
              },
          ]
        : []),
    ...(antallMedUkjentVerdi > 0
        ? [
              {
                  nøkkel: 'UKJENT',
                  kode: `Ukjent ${verdi}`,
                  paragrafer: [],
                  antallBehandlinger: antallMedUkjentVerdi,
              },
          ]
        : []),
];

const hentFordelingsgrupper = (periode: SakStatistikkPeriode, type: Fordelingstype): Fordelingsgruppe[] => {
    switch (type) {
        case 'AVSLAG':
            return periode.avslagsgrunner.map((fordeling) => ({
                nøkkel: fordeling.sakYtelse,
                sakYtelse: fordeling.sakYtelse,
                resultat: null,
                totalt: fordeling.antallAvslag,
                rader: leggTilDatakvalitetsrader(
                    fordeling.grunner.map((grunn) => ({
                        nøkkel: grunn.kode,
                        kode: grunn.kode,
                        paragrafer: grunn.paragrafer,
                        antallBehandlinger: grunn.antallBehandlinger,
                    })),
                    fordeling.antallUtenBegrunnelse,
                    fordeling.antallMedUkjentBegrunnelse,
                    'begrunnelse',
                ),
            }));
        case 'OPPHØR':
            return periode.opphørsgrunner.map((fordeling) => ({
                nøkkel: fordeling.sakYtelse,
                sakYtelse: fordeling.sakYtelse,
                resultat: null,
                totalt: fordeling.antallOpphør,
                rader: leggTilDatakvalitetsrader(
                    fordeling.grunner.map((grunn) => ({
                        nøkkel: grunn.kode,
                        kode: grunn.kode,
                        paragrafer: grunn.paragrafer,
                        antallBehandlinger: grunn.antallBehandlinger,
                    })),
                    fordeling.antallUtenBegrunnelse,
                    fordeling.antallMedUkjentBegrunnelse,
                    'begrunnelse',
                ),
            }));
        case 'KLAGEAVVISNING':
            return periode.klageavvisningsgrunner.map((fordeling) => ({
                nøkkel: fordeling.sakYtelse,
                sakYtelse: fordeling.sakYtelse,
                resultat: null,
                totalt: fordeling.antallAvvisteKlager,
                rader: leggTilDatakvalitetsrader(
                    fordeling.grunner.map((grunn) => ({
                        nøkkel: grunn.kode,
                        kode: grunn.kode,
                        paragrafer: [],
                        antallBehandlinger: grunn.antallBehandlinger,
                    })),
                    fordeling.antallUtenBegrunnelse,
                    fordeling.antallMedUkjentBegrunnelse,
                    'begrunnelse',
                ),
            }));
        case 'KLAGEHJEMMEL':
            return periode.klagehjemler.map((fordeling) => ({
                nøkkel: `${fordeling.sakYtelse}\u0000${fordeling.resultat}`,
                sakYtelse: fordeling.sakYtelse,
                resultat: fordeling.resultat,
                totalt: fordeling.antallKlager,
                rader: leggTilDatakvalitetsrader(
                    fordeling.hjemler.map((hjemmel) => ({
                        nøkkel: hjemmel.kode,
                        kode: hjemmel.kode,
                        paragrafer: [{ lov: hjemmel.lov, paragraf: hjemmel.paragraf }],
                        antallBehandlinger: hjemmel.antallBehandlinger,
                    })),
                    fordeling.antallUtenHjemmel,
                    fordeling.antallMedUkjentHjemmel,
                    'hjemmel',
                ),
            }));
        case 'KLAGEOMGJØRING':
            return periode.klageomgjøringsgrunner.map((fordeling) => ({
                nøkkel: `${fordeling.sakYtelse}\u0000${fordeling.resultat}`,
                sakYtelse: fordeling.sakYtelse,
                resultat: fordeling.resultat,
                totalt: fordeling.antallKlager,
                rader: leggTilDatakvalitetsrader(
                    fordeling.grunner.map((grunn) => ({
                        nøkkel: grunn.kode,
                        kode: grunn.kode,
                        paragrafer: [],
                        antallBehandlinger: grunn.antallBehandlinger,
                    })),
                    fordeling.antallUtenBegrunnelse,
                    fordeling.antallMedUkjentBegrunnelse,
                    'begrunnelse',
                ),
            }));
    }
};

const summerFordelingsgrupper = (perioder: SakStatistikkPeriode[], type: Fordelingstype): Fordelingsgruppe[] => {
    const grupper = new Map<string, Fordelingsgruppe>();
    perioder.forEach((periode) => {
        hentFordelingsgrupper(periode, type).forEach((gruppe) => {
            const eksisterende = grupper.get(gruppe.nøkkel);
            const rader = new Map(eksisterende?.rader.map((rad) => [rad.nøkkel, rad]) ?? []);
            gruppe.rader.forEach((rad) => {
                const eksisterendeRad = rader.get(rad.nøkkel);
                rader.set(rad.nøkkel, {
                    ...rad,
                    antallBehandlinger: (eksisterendeRad?.antallBehandlinger ?? 0) + rad.antallBehandlinger,
                });
            });
            grupper.set(gruppe.nøkkel, {
                ...gruppe,
                totalt: (eksisterende?.totalt ?? 0) + gruppe.totalt,
                rader: [...rader.values()],
            });
        });
    });
    return [...grupper.values()].sort(
        (a, b) =>
            a.sakYtelse.localeCompare(b.sakYtelse, 'nb-NO') ||
            (a.resultat ?? '').localeCompare(b.resultat ?? '', 'nb-NO'),
    );
};

const erHelPeriode = (periode: SakStatistikkPeriode, oppløsning: Statistikkoppløsning): boolean => {
    const fra = parseNonNullableIsoDateOnly(periode.fraOgMed);
    const til = parseNonNullableIsoDateOnly(periode.tilOgMed);
    if (oppløsning === 'UKE') {
        const forventetTil = new Date(fra);
        forventetTil.setDate(forventetTil.getDate() + 6);
        return fra.getDay() === 1 && til.getDay() === 0 && toIsoDateOnlyString(forventetTil) === periode.tilOgMed;
    }
    if (oppløsning === 'MÅNED') {
        const sisteDag = new Date(fra.getFullYear(), fra.getMonth() + 1, 0).getDate();
        return (
            fra.getDate() === 1 &&
            til.getDate() === sisteDag &&
            fra.getFullYear() === til.getFullYear() &&
            fra.getMonth() === til.getMonth()
        );
    }
    return fra.getMonth() === 0 && fra.getDate() === 1 && til.getMonth() === 11 && til.getDate() === 31;
};

const formaterFordelingsendring = (
    radnøkkel: string,
    gruppenøkkel: string,
    forrige: SakStatistikkPeriode,
    siste: SakStatistikkPeriode,
    type: Fordelingstype,
): string => {
    const hentAntall = (periode: SakStatistikkPeriode): number =>
        hentFordelingsgrupper(periode, type)
            .find((gruppe) => gruppe.nøkkel === gruppenøkkel)
            ?.rader.find((rad) => rad.nøkkel === radnøkkel)?.antallBehandlinger ?? 0;
    const før = hentAntall(forrige);
    const nå = hentAntall(siste);
    const differanse = nå - før;
    if (før === 0) return nå === 0 ? '–' : `Fra 0 til ${nå.toLocaleString('nb-NO')}`;
    const prosent = (differanse / før) * 100;
    return `${differanse >= 0 ? '+' : ''}${differanse.toLocaleString('nb-NO')} (${prosent >= 0 ? '+' : ''}${formaterProsent(prosent)} %)`;
};

const Fordelingsseksjon = ({
    perioder,
    oppløsning,
    oppsett,
}: {
    perioder: SakStatistikkPeriode[];
    oppløsning: Statistikkoppløsning;
    oppsett: Fordelingsoppsett;
}) => {
    const grupper = summerFordelingsgrupper(perioder, oppsett.type);
    if (grupper.length === 0) return null;

    const helePerioder = perioder.filter((periode) => erHelPeriode(periode, oppløsning));
    const sisteHelePeriode = helePerioder.at(-1);
    const forrigeHelePeriode = helePerioder.at(-2);
    const sammenligningstekst =
        sisteHelePeriode && forrigeHelePeriode
            ? `${formaterDelperiode(sisteHelePeriode.fraOgMed, sisteHelePeriode.tilOgMed, oppløsning)} mot ${formaterDelperiode(forrigeHelePeriode.fraOgMed, forrigeHelePeriode.tilOgMed, oppløsning)}`
            : null;

    return (
        <section aria-labelledby={oppsett.id}>
            <VStack gap="4">
                <div>
                    <Heading id={oppsett.id} level="4" size="small">
                        {oppsett.tittel}
                    </Heading>
                    <BodyShort>
                        Én behandling kan ha flere {oppsett.radoverskrift.toLocaleLowerCase('nb-NO')}. Radene kan derfor
                        ikke summeres til hovedtallet.
                    </BodyShort>
                </div>
                {grupper.map((gruppe) => {
                    const visParagrafkolonne =
                        oppsett.type !== 'KLAGEHJEMMEL' && gruppe.rader.some((rad) => rad.paragrafer.length > 0);
                    return (
                        <VStack key={gruppe.nøkkel} gap="3">
                            <div>
                                <Heading level="5" size="xsmall">
                                    {tekstFraKode(gruppe.sakYtelse)}
                                    {gruppe.resultat ? ` / ${tekstFraKode(gruppe.resultat)}` : ''}
                                </Heading>
                                <BodyShort size="small">
                                    {oppsett.totaltekst}: {gruppe.totalt.toLocaleString('nb-NO')}
                                </BodyShort>
                            </div>
                            <div className={styles.tabellRamme}>
                                <Table size="small">
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>{oppsett.radoverskrift}</Table.HeaderCell>
                                            {visParagrafkolonne && <Table.HeaderCell>Paragraf</Table.HeaderCell>}
                                            <Table.HeaderCell align="right">
                                                Behandlinger i valgt periode
                                            </Table.HeaderCell>
                                            <Table.HeaderCell align="right">Andel av hovedtallet</Table.HeaderCell>
                                            <Table.HeaderCell align="right">
                                                {sammenligningstekst
                                                    ? `Endring: ${sammenligningstekst}`
                                                    : 'Endring mellom hele perioder'}
                                            </Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {[...gruppe.rader]
                                            .sort(
                                                (a, b) =>
                                                    b.antallBehandlinger - a.antallBehandlinger ||
                                                    a.kode.localeCompare(b.kode, 'nb-NO'),
                                            )
                                            .map((rad) => (
                                                <Table.Row key={rad.nøkkel}>
                                                    <Table.DataCell>
                                                        {rad.nøkkel === 'MANGLER' || rad.nøkkel === 'UKJENT'
                                                            ? rad.kode
                                                            : oppsett.type === 'KLAGEHJEMMEL'
                                                              ? formaterParagrafer(rad.paragrafer)
                                                              : tekstFraKode(rad.kode)}
                                                    </Table.DataCell>
                                                    {visParagrafkolonne && (
                                                        <Table.DataCell>
                                                            {formaterParagrafer(rad.paragrafer)}
                                                        </Table.DataCell>
                                                    )}
                                                    <Table.DataCell align="right">
                                                        {rad.antallBehandlinger.toLocaleString('nb-NO')}
                                                    </Table.DataCell>
                                                    <Table.DataCell align="right">
                                                        {gruppe.totalt === 0
                                                            ? '–'
                                                            : `${formaterProsent(
                                                                  (rad.antallBehandlinger / gruppe.totalt) * 100,
                                                              )} %`}
                                                    </Table.DataCell>
                                                    <Table.DataCell align="right">
                                                        {sisteHelePeriode && forrigeHelePeriode
                                                            ? formaterFordelingsendring(
                                                                  rad.nøkkel,
                                                                  gruppe.nøkkel,
                                                                  forrigeHelePeriode,
                                                                  sisteHelePeriode,
                                                                  oppsett.type,
                                                              )
                                                            : 'Ikke nok hele perioder'}
                                                    </Table.DataCell>
                                                </Table.Row>
                                            ))}
                                    </Table.Body>
                                </Table>
                            </div>
                        </VStack>
                    );
                })}
            </VStack>
        </section>
    );
};

const Utfallsfordelinger = ({
    perioder,
    kategori,
    oppløsning,
}: {
    perioder: SakStatistikkPeriode[];
    kategori: SakStatistikkKategori;
    oppløsning: Statistikkoppløsning;
}) => {
    const oppsett: Fordelingsoppsett[] =
        kategori === 'SØKNAD'
            ? [
                  {
                      type: 'AVSLAG',
                      id: 'avslagsgrunner-tittel',
                      tittel: 'Avslagsgrunner for søknader',
                      radoverskrift: 'Avslagsgrunn',
                      totaltekst: 'Søknadsavslag',
                  },
              ]
            : kategori === 'REVURDERING'
              ? [
                    {
                        type: 'OPPHØR',
                        id: 'opphørsgrunner-tittel',
                        tittel: 'Opphørsgrunner for revurderinger',
                        radoverskrift: 'Opphørsgrunn',
                        totaltekst: 'Opphør',
                    },
                ]
              : kategori === 'KLAGE'
                ? [
                      {
                          type: 'KLAGEAVVISNING',
                          id: 'klageavvisningsgrunner-tittel',
                          tittel: 'Grunner til avvist klage',
                          radoverskrift: 'Avvisningsgrunn',
                          totaltekst: 'Avviste klager',
                      },
                      {
                          type: 'KLAGEHJEMMEL',
                          id: 'klagehjemler-tittel',
                          tittel: 'Hjemler brukt i klagebehandlingen',
                          radoverskrift: 'Hjemmel',
                          totaltekst: 'Klager',
                      },
                      {
                          type: 'KLAGEOMGJØRING',
                          id: 'klageomgjøringsgrunner-tittel',
                          tittel: 'Grunner til omgjøring',
                          radoverskrift: 'Omgjøringsgrunn',
                          totaltekst: 'Klager',
                      },
                  ]
                : [];

    if (oppsett.length === 0) return null;
    return (
        <VStack gap="6">
            {oppsett.map((element) => (
                <Fordelingsseksjon key={element.type} perioder={perioder} oppløsning={oppløsning} oppsett={element} />
            ))}
        </VStack>
    );
};

const BeholdningDiagram = ({
    perioder,
    oppløsning,
}: {
    perioder: SakStatistikkPeriode[];
    oppløsning: Statistikkoppløsning;
}) => {
    const data = grupperPerPeriode(perioder, (periode) =>
        periode.beholdning.map((rad) => ({ navn: rad.status, antall: rad.antall })),
    );
    const kolonner = [...new Set(data.flatMap((periode) => periode.grupper.map((gruppe) => gruppe.navn)))].sort(
        (a, b) => a.localeCompare(b, 'nb-NO'),
    );
    return stabletDiagram(
        'beholdning-tittel',
        'Beholdning',
        'Behandlinger som fortsatt var åpne hos vedtaksinstansen ved periodens slutt, fordelt etter siste registrerte status. Avsluttende statuser og oversendte klager inngår ikke. Behandlingene kan ha startet tidligere, og periodene summeres ikke.',
        data,
        kolonner,
        'SISTE_PERIODE',
        oppløsning,
    );
};

const UtfallDiagram = ({
    perioder,
    oppløsning,
}: {
    perioder: SakStatistikkPeriode[];
    oppløsning: Statistikkoppløsning;
}) => {
    const data = grupperPerPeriode(perioder, (periode) =>
        periode.utfall.map((rad) => ({
            navn: `${rad.status} / ${rad.resultat ?? 'MANGLER RESULTAT'}`,
            antall: rad.antall,
        })),
    );
    const kolonner = [...new Set(data.flatMap((periode) => periode.grupper.map((gruppe) => gruppe.navn)))].sort(
        (a, b) => a.localeCompare(b, 'nb-NO'),
    );
    return stabletDiagram(
        'utfall-tittel',
        'Utfall i perioden',
        'Behandlinger som fikk sin første avsluttende hendelse i perioden: iverksatt eller avsluttet, og for klager også oversendt. «Avbrutt» er et resultat, ikke en status. Hver behandling telles én gang. Utfallet kan gjelde en behandling som startet i en tidligere periode.',
        data,
        kolonner,
        'SUMMER_PERIODEN',
        oppløsning,
    );
};

export default SakstatistikkPanel;
