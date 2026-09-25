import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyShort, Box, Heading, HStack, Label, Loader, VStack } from '@navikt/ds-react';
import { useEffect } from 'react';

import { hentHistoriskeVedtaksperioder } from '~src/api/historiskAlderssakApi';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import { HistoriskVedtaksperiode } from '~src/types/HistoriskAlderssak';
import { formatDate, formatDateTime } from '~src/utils/date/dateUtils';
import { formatCurrency } from '~src/utils/format/formatUtils';

import HistoriskAlderssakApiErrorAlert from './HistoriskAlderssakApiErrorAlert';
import {
    behandlingstypeForVisning,
    bosituasjonForVisning,
    endringskoderForVisning,
    godkjentAvOsForVisning,
    opphørsgrunnForVisning,
    resultatForVisning,
    saksreferanseForVisning,
} from './HistoriskAlderssakUtils';
import styles from './HistoriskAlderssakVisning.module.less';
import OpprettHistoriskInfotrygdRevurdering from './OpprettHistoriskInfotrygdRevurdering';

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

const HistoriskPeriode = (props: { periode: HistoriskVedtaksperiode }) => {
    const { periode } = props;

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
                                Endringskoder i Infotrygd
                            </Label>
                            <BodyShort as="dd">
                                {periode.endringskoder.length > 0
                                    ? endringskoderForVisning(periode.endringskoder).join(', ')
                                    : 'Ingen endringskoder'}
                            </BodyShort>
                        </div>
                        <div>
                            <Label as="dt" size="small">
                                Saksreferanse
                            </Label>
                            <BodyShort as="dd">{saksreferanseForVisning(periode.saksreferanse)}</BodyShort>
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
                            <BodyShort as="dd">{godkjentAvOsForVisning(periode.godkjentAvOs)}</BodyShort>
                        </div>
                    </dl>
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

const HistoriskAlderssakVisning = (props: {
    fnr: string;
    tilbakeHref: string;
    tilbakeTekst: string;
    onRevurderingOpprettet: (revurderingId: string, sakId: string) => void;
}) => {
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
                    <BodyShort>
                        Saksreferansen vises som kontornummer / saksblokk / saksnummer. Behandlende kontor vises
                        separat.
                    </BodyShort>
                </div>

                {pipe(
                    vedtaksperioder,
                    RemoteData.fold(
                        () => null,
                        () => <Loader title="Henter historiske vedtaksperioder" size="large" />,
                        (error) => <HistoriskAlderssakApiErrorAlert error={error} />,
                        (perioder) => (
                            <VStack gap="6">
                                <OpprettHistoriskInfotrygdRevurdering
                                    fnr={props.fnr}
                                    vedtaksperioder={perioder}
                                    onOpprettet={props.onRevurderingOpprettet}
                                />
                                <HistoriskePerioder perioder={perioder} />
                            </VStack>
                        ),
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
