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
    resultatForVisning,
    sorterHistoriskeVedtaksperioder,
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

const formatMånedsbeløpsperiode = (periode: HistoriskMånedsbeløpsperiode): string => {
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
                                    Periode
                                </Label>
                                <BodyShort as="dd">{formatMånedsbeløpsperiode(periode)}</BodyShort>
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
                                <BodyShort as="dd">{formatCurrency(periode.fradrag)}</BodyShort>
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
            <ExpansionCard
                className={styles.vedtakskort}
                open={åpen}
                onToggle={handleToggle}
                aria-label={`Vedtak for ${formatPeriode(periode)}`}
            >
                <ExpansionCard.Header>
                    <ExpansionCard.Title as="h2" size="small">
                        {formatPeriode(periode)}
                    </ExpansionCard.Title>
                    <ExpansionCard.Description>
                        {behandlingstypeForVisning(periode)} – {resultatForVisning(periode)}
                    </ExpansionCard.Description>
                </ExpansionCard.Header>
                <ExpansionCard.Content>
                    <VStack gap="5">
                        <HStack justify="end">
                            <Tag variant={periode.gyldig ? 'success' : 'warning'} size="small">
                                {periode.gyldig ? 'Gyldig' : 'Ikke gyldig'}
                            </Tag>
                        </HStack>

                        <dl className={styles.detaljer}>
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
                        </dl>

                        <div>
                            <Heading level="3" size="xsmall" spacing>
                                Månedsbeløp
                            </Heading>
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
                        </div>
                    </VStack>
                </ExpansionCard.Content>
            </ExpansionCard>
        </li>
    );
};

const HistoriskePerioder = (props: { perioder: HistoriskVedtaksperiode[] }) => {
    if (props.perioder.length === 0) {
        return <Alert variant="info">Ingen historiske vedtaksperioder ble funnet.</Alert>;
    }

    const sortertePerioder = sorterHistoriskeVedtaksperioder(props.perioder);

    return (
        <ol className={styles.tidslinje} aria-label="Historiske vedtaksperioder">
            {sortertePerioder.map((periode) => (
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
