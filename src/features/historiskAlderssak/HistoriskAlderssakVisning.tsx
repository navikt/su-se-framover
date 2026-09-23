import * as RemoteData from '@devexperts/remote-data-ts';
import {
    Alert,
    BodyShort,
    Box,
    Button,
    ExpansionCard,
    Heading,
    HStack,
    Label,
    Loader,
    Tag,
    VStack,
} from '@navikt/ds-react';
import { useEffect, useState } from 'react';

import { hentHistoriskeMånedsbeløp, hentHistoriskeVedtaksperioder } from '~src/api/historiskAlderssakApi';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import { HistoriskMånedsbeløpsperiode, HistoriskVedtaksperiode } from '~src/types/HistoriskAlderssak';
import { formatDate, formatDateTime } from '~src/utils/date/dateUtils';
import { formatCurrency } from '~src/utils/format/formatUtils';

import HistoriskAlderssakApiErrorAlert from './HistoriskAlderssakApiErrorAlert';
import {
    behandlingstypeForVisning,
    bosituasjonForVisning,
    fradragskoderForVisning,
    opphørsgrunnForVisning,
    resultatForVisning,
} from './HistoriskAlderssakUtils';
import styles from './HistoriskAlderssakVisning.module.less';

const formatPeriode = (periode: HistoriskVedtaksperiode): string => {
    if (periode.fraOgMed && periode.tilOgMed) {
        return `${formatDate(periode.fraOgMed)}–${formatDate(periode.tilOgMed)}`;
    }
    if (periode.fraOgMed) {
        return `Fra ${formatDate(periode.fraOgMed)}`;
    }
    if (periode.tilOgMed) {
        return `Til ${formatDate(periode.tilOgMed)}`;
    }
    return 'Periode ikke registrert';
};

const Månedsbeløp = (props: { perioder: HistoriskMånedsbeløpsperiode[] }) => {
    if (props.perioder.length === 0) {
        return <Alert variant="info">Ingen månedsbeløp er registrert for vedtaket.</Alert>;
    }

    return (
        <ul className={styles.månedsbeløpsliste} aria-label="Månedsbeløp for vedtaket">
            {props.perioder.map((periode, index) => (
                <li key={periode.linjeId ?? `${periode.fraOgMed}-${periode.tilOgMed}-${index}`}>
                    <Box background="surface-subtle" borderWidth="1" borderRadius="medium" padding="4">
                        <dl className={styles.månedsbeløpsdetaljer}>
                            <div>
                                <Label as="dt" size="small">
                                    Fra og med
                                </Label>
                                <BodyShort as="dd">
                                    {periode.fraOgMed ? formatDate(periode.fraOgMed) : 'Ikke registrert'}
                                </BodyShort>
                            </div>
                            <div>
                                <Label as="dt" size="small">
                                    Til og med
                                </Label>
                                <BodyShort as="dd">
                                    {periode.tilOgMed ? formatDate(periode.tilOgMed) : 'Ikke registrert'}
                                </BodyShort>
                            </div>
                            <div>
                                <Label as="dt" size="small">
                                    Sats
                                </Label>
                                <BodyShort as="dd">{formatCurrency(periode.sats)}</BodyShort>
                            </div>
                            <div>
                                <Label as="dt" size="small">
                                    Fradrag
                                </Label>
                                <dd className={styles.fradrag}>
                                    <BodyShort>{formatCurrency(periode.fradrag)}</BodyShort>
                                    {periode.fradragskoder.length === 0 ? (
                                        <BodyShort size="small">Ingen fradragskoder</BodyShort>
                                    ) : (
                                        <ul className={styles.kodeliste} aria-label="Fradrag som inngår">
                                            {fradragskoderForVisning(periode.fradragskoder).map((kode, kodeindeks) => (
                                                <li key={`${kode}-${kodeindeks}`}>
                                                    <BodyShort size="small">{kode}</BodyShort>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </dd>
                            </div>
                            <div>
                                <Label as="dt" size="small">
                                    Beløp
                                </Label>
                                <BodyShort as="dd" weight="semibold">
                                    {formatCurrency(periode.beløp)}
                                </BodyShort>
                            </div>
                            <div>
                                <Label as="dt" size="small">
                                    Linje-ID
                                </Label>
                                <BodyShort as="dd">{periode.linjeId ?? 'Ikke registrert'}</BodyShort>
                            </div>
                        </dl>
                    </Box>
                </li>
            ))}
        </ul>
    );
};

const HistoriskPeriode = (props: { periode: HistoriskVedtaksperiode }) => {
    const { periode } = props;
    const [åpen, setÅpen] = useState(false);
    const [månedsbeløp, hentMånedsbeløp] = useApiCall(hentHistoriskeMånedsbeløp);

    const handleToggle = (skalÅpnes: boolean) => {
        setÅpen(skalÅpnes);

        if (skalÅpnes && RemoteData.isInitial(månedsbeløp)) {
            hentMånedsbeløp({ vedtakId: periode.vedtakId });
        }
    };

    return (
        <li className={styles.tidslinjeelement}>
            <span className={styles.tidslinjemarkør} aria-hidden />
            <Box background="surface-default" borderWidth="1" borderRadius="medium" padding="5">
                <VStack gap="5">
                    <HStack gap="4" justify="space-between" align="start" wrap>
                        <VStack gap="1">
                            <Heading level="2" size="small">
                                {formatPeriode(periode)}
                            </Heading>
                            <BodyShort weight="semibold">{behandlingstypeForVisning(periode)}</BodyShort>
                        </VStack>
                        <div>
                            <Tag variant={periode.gyldig ? 'success' : 'warning'} size="small">
                                {periode.gyldig ? 'Gyldig' : 'Ikke gyldig'}
                            </Tag>
                        </div>
                    </HStack>

                    <dl className={styles.detaljer}>
                        <div>
                            <Label as="dt" size="small">
                                Resultat
                            </Label>
                            <BodyShort as="dd">{resultatForVisning(periode)}</BodyShort>
                        </div>
                        <div>
                            <Label as="dt" size="small">
                                Bosituasjon
                            </Label>
                            <BodyShort as="dd">{bosituasjonForVisning(periode)}</BodyShort>
                        </div>
                        <div>
                            <Label as="dt" size="small">
                                Årlig ytelsesbeløp
                            </Label>
                            <BodyShort as="dd">
                                {periode.årligYtelsesbeløp === null
                                    ? 'Ikke registrert'
                                    : formatCurrency(periode.årligYtelsesbeløp, { numDecimals: 0 })}
                            </BodyShort>
                        </div>
                        <div>
                            <Label as="dt" size="small">
                                Registrert
                            </Label>
                            <BodyShort as="dd">
                                {periode.registrertTidspunkt
                                    ? formatDateTime(periode.registrertTidspunkt)
                                    : 'Ikke registrert'}
                            </BodyShort>
                        </div>
                        <div>
                            <Label as="dt" size="small">
                                Stønads-ID
                            </Label>
                            <BodyShort as="dd">{periode.stønadId}</BodyShort>
                        </div>
                        <div>
                            <Label as="dt" size="small">
                                Vedtaks-ID
                            </Label>
                            <BodyShort as="dd">{periode.vedtakId}</BodyShort>
                        </div>
                        <div>
                            <Label as="dt" size="small">
                                Oppdrag-ID
                            </Label>
                            <BodyShort as="dd">{periode.oppdragId ?? 'Ikke registrert'}</BodyShort>
                        </div>
                        <div>
                            <Label as="dt" size="small">
                                Opphørsgrunn
                            </Label>
                            <BodyShort as="dd">{opphørsgrunnForVisning(periode)}</BodyShort>
                        </div>
                        <div>
                            <Label as="dt" size="small">
                                Revurderingsdato i Infotrygd
                            </Label>
                            <BodyShort as="dd">
                                {periode.revurderingsdato ? formatDate(periode.revurderingsdato) : 'Ikke registrert'}
                            </BodyShort>
                        </div>
                        <div>
                            <Label as="dt" size="small">
                                Endringskoder
                            </Label>
                            <BodyShort as="dd">
                                {periode.endringskoder.length > 0
                                    ? periode.endringskoder.join(', ')
                                    : 'Ingen endringskoder'}
                            </BodyShort>
                        </div>
                        <div>
                            <Label as="dt" size="small">
                                Kontornummer
                            </Label>
                            <BodyShort as="dd">{periode.saksreferanse.kontornummer ?? 'Ikke registrert'}</BodyShort>
                        </div>
                        <div>
                            <Label as="dt" size="small">
                                Saksblokk
                            </Label>
                            <BodyShort as="dd">{periode.saksreferanse.saksblokk ?? 'Ikke registrert'}</BodyShort>
                        </div>
                        <div>
                            <Label as="dt" size="small">
                                Saksnummer
                            </Label>
                            <BodyShort as="dd">{periode.saksreferanse.saksnummer ?? 'Ikke registrert'}</BodyShort>
                        </div>
                        <div>
                            <Label as="dt" size="small">
                                Behandlende kontor
                            </Label>
                            <BodyShort as="dd">
                                {periode.saksreferanse.behandlendeKontor ?? 'Ikke registrert'}
                            </BodyShort>
                        </div>
                        <div>
                            <Label as="dt" size="small">
                                Sendt til Oppdrag
                            </Label>
                            <BodyShort as="dd">
                                {periode.sendtTilOs ? formatDateTime(periode.sendtTilOs) : 'Ikke registrert'}
                            </BodyShort>
                        </div>
                        <div>
                            <Label as="dt" size="small">
                                Mottatt fra Oppdrag
                            </Label>
                            <BodyShort as="dd">
                                {periode.mottattFraOs ? formatDateTime(periode.mottattFraOs) : 'Ikke registrert'}
                            </BodyShort>
                        </div>
                        <div>
                            <Label as="dt" size="small">
                                Godkjent av Oppdrag
                            </Label>
                            <BodyShort as="dd">
                                {periode.godkjentAvOs ? formatDateTime(periode.godkjentAvOs) : 'Ikke registrert'}
                            </BodyShort>
                        </div>
                    </dl>

                    <ExpansionCard
                        className={styles.vedtakskort}
                        open={åpen}
                        onToggle={handleToggle}
                        aria-label={`Månedsbeløp for vedtak ${formatPeriode(periode)}`}
                    >
                        <ExpansionCard.Header>
                            <ExpansionCard.Title as="h3" size="small">
                                Månedsbeløp
                            </ExpansionCard.Title>
                            <ExpansionCard.Description>
                                Vis sats, fradrag og beregnet beløp for vedtaket.
                            </ExpansionCard.Description>
                        </ExpansionCard.Header>
                        <ExpansionCard.Content>
                            {pipe(
                                månedsbeløp,
                                RemoteData.fold(
                                    () => null,
                                    () => <Loader title="Henter månedsbeløp" size="medium" />,
                                    (error) => (
                                        <VStack gap="3" align="start">
                                            <HistoriskAlderssakApiErrorAlert error={error} />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="small"
                                                onClick={() => hentMånedsbeløp({ vedtakId: periode.vedtakId })}
                                            >
                                                Prøv igjen
                                            </Button>
                                        </VStack>
                                    ),
                                    (perioder) => <Månedsbeløp perioder={perioder} />,
                                ),
                            )}
                        </ExpansionCard.Content>
                    </ExpansionCard>
                </VStack>
            </Box>
        </li>
    );
};

const HistoriskePerioder = (props: { perioder: HistoriskVedtaksperiode[] }) => {
    if (props.perioder.length === 0) {
        return <Alert variant="info">Ingen historiske vedtaksperioder ble funnet.</Alert>;
    }

    return (
        <ol className={styles.tidslinje} aria-label="Historiske vedtaksperioder">
            {props.perioder.map((periode) => (
                <HistoriskPeriode key={`${periode.stønadId}-${periode.vedtakId}`} periode={periode} />
            ))}
        </ol>
    );
};

const HistoriskAlderssakVisning = (props: { fnr: string; tilbakeHref: string; tilbakeTekst: string }) => {
    const [vedtaksperioder, hentVedtaksperioder] = useApiCall(hentHistoriskeVedtaksperioder);

    useEffect(() => {
        hentVedtaksperioder({ fnr: props.fnr });
    }, [hentVedtaksperioder, props.fnr]);

    return (
        <section className={styles.side} aria-labelledby="infotrygd-tittel">
            <VStack gap="6">
                <div>
                    <Heading id="infotrygd-tittel" level="1" size="large" spacing>
                        Infotrygd-sak
                    </Heading>
                    <BodyShort>Historiske vedtaksperioder for alderssaken.</BodyShort>
                </div>

                {pipe(
                    vedtaksperioder,
                    RemoteData.fold(
                        () => null,
                        () => <Loader title="Henter historiske vedtaksperioder" size="large" />,
                        (error) => <HistoriskAlderssakApiErrorAlert error={error} />,
                        (perioder) => <HistoriskePerioder perioder={perioder} />,
                    ),
                )}

                <div>
                    <LinkAsButton variant="secondary" href={props.tilbakeHref}>
                        {props.tilbakeTekst}
                    </LinkAsButton>
                </div>
            </VStack>
        </section>
    );
};

export default HistoriskAlderssakVisning;
