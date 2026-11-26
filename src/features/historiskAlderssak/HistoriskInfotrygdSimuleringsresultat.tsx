import { Alert, BodyShort, ExpansionCard, Heading, Label, Table, VStack } from '@navikt/ds-react';

import { HistoriskInfotrygdSimulering } from '~src/types/HistoriskInfotrygdRevurdering';
import { Periode } from '~src/types/Periode';
import { formatDate, formatDateTime } from '~src/utils/date/dateUtils';
import { formatCurrency } from '~src/utils/format/formatUtils';

import styles from './HistoriskAlderssakVisning.module.less';

interface Props {
    simulering: HistoriskInfotrygdSimulering;
    revurderingsperiode: Periode<string>;
}

const HistoriskInfotrygdSimuleringsresultat = ({ simulering, revurderingsperiode }: Props) => (
    <VStack gap="4">
        <div>
            <Heading level="3" size="small" spacing>
                Sist lagrede simuleringsresultat
            </Heading>
            <BodyShort>Simulert {formatDateTime(simulering.simulert)}.</BodyShort>
            <BodyShort>
                Simuleringsperiode: {formatDate(simulering.simuleringsperiode.fraOgMed)}–
                {formatDate(simulering.simuleringsperiode.tilOgMed)}.
            </BodyShort>
        </div>
        {simulering.erUtprøving && (
            <Alert variant="info">
                Dette er utprøving av historisk simulering. Ingen utbetaling er sendt. Resultatet kan inneholde andre
                ytelser, og posteringene skal ikke summeres som etterbetaling av supplerende stønad.
            </Alert>
        )}
        {simulering.infomelding?.trim() && <Alert variant="info">{simulering.infomelding}</Alert>}
        <BodyShort>
            Samlet beløp i simuleringsresponsen for faggruppe {simulering.resultat.faggruppe}:{' '}
            {formatCurrency(simulering.resultat.beløp)}. Dette er ikke nødvendigvis beløpet for supplerende stønad.
        </BodyShort>
        {simulering.resultat.perioder.length === 0 && (
            <Alert variant="error">Simuleringsresultatet mangler perioder. Hent behandlingen på nytt.</Alert>
        )}
        {simulering.resultat.perioder.map((periode, periodeIndex) => {
            const omfatterAndreMåneder =
                periode.fraOgMed < revurderingsperiode.fraOgMed || periode.tilOgMed > revurderingsperiode.tilOgMed;
            const periodetekst = `${formatDate(periode.fraOgMed)}–${formatDate(periode.tilOgMed)}`;

            return (
                <ExpansionCard
                    key={`${periode.fraOgMed}-${periode.tilOgMed}-${periodeIndex}`}
                    aria-label={`Simuleringsresultat for ${periodetekst}`}
                >
                    <ExpansionCard.Header>
                        <ExpansionCard.Title as="h4" size="small">
                            {periodetekst}
                        </ExpansionCard.Title>
                        {omfatterAndreMåneder && (
                            <ExpansionCard.Description>
                                Omfatter tid utenfor revurderingsperioden.
                            </ExpansionCard.Description>
                        )}
                    </ExpansionCard.Header>
                    <ExpansionCard.Content>
                        <VStack gap="6">
                            {periode.utbetalinger.length === 0 && (
                                <BodyShort>Ingen utbetalingsdetaljer er returnert for denne perioden.</BodyShort>
                            )}
                            {periode.utbetalinger.map((utbetaling, utbetalingIndex) => (
                                <section key={`${utbetaling.oppdragsId}-${utbetaling.stoppnivåId}-${utbetalingIndex}`}>
                                    <Heading level="5" size="xsmall" spacing>
                                        Fagområde {utbetaling.fagområde}
                                    </Heading>
                                    <dl className={styles.detaljer}>
                                        <div>
                                            <Label as="dt" size="small">
                                                Oppdragsreferanse fra fagsystemet (fagsystemId)
                                            </Label>
                                            <BodyShort as="dd">{utbetaling.fagsystemId}</BodyShort>
                                        </div>
                                        <div>
                                            <Label as="dt" size="small">
                                                Oppdragets ID
                                            </Label>
                                            <BodyShort as="dd">{utbetaling.oppdragsId}</BodyShort>
                                        </div>
                                        <div>
                                            <Label as="dt" size="small">
                                                Forfall
                                            </Label>
                                            <BodyShort as="dd">{formatDate(utbetaling.forfall)}</BodyShort>
                                        </div>
                                        <div>
                                            <Label as="dt" size="small">
                                                Feilkonto
                                            </Label>
                                            <BodyShort as="dd">{utbetaling.feilkonto ? 'Ja' : 'Nei'}</BodyShort>
                                        </div>
                                    </dl>
                                    {utbetaling.detaljer.length === 0 ? (
                                        <BodyShort>Ingen posteringer er returnert for dette oppdraget.</BodyShort>
                                    ) : (
                                        <Table size="small" className={styles.simuleringstabell}>
                                            <caption>Posteringer i simuleringsresponsen</caption>
                                            <Table.Header>
                                                <Table.Row>
                                                    <Table.HeaderCell scope="col">
                                                        Periode og postering
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell scope="col" align="right">
                                                        Beløp
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell scope="col">Tilbakeføring</Table.HeaderCell>
                                                </Table.Row>
                                            </Table.Header>
                                            <Table.Body>
                                                {utbetaling.detaljer.map((detalj, detaljIndex) => (
                                                    <Table.Row key={`${detalj.linjeId}-${detaljIndex}`}>
                                                        <Table.HeaderCell scope="row">
                                                            {formatDate(detalj.faktiskFraOgMed)}–
                                                            {formatDate(detalj.faktiskTilOgMed)}
                                                            <BodyShort size="small">
                                                                Klassekode: {detalj.klassekode}.{' '}
                                                                {detalj.klassekodeBeskrivelse}
                                                            </BodyShort>
                                                            <BodyShort size="small">
                                                                Klassetype: {detalj.klasseType}.{' '}
                                                                {detalj.klasseTypeBeskrivelse}
                                                            </BodyShort>
                                                            <BodyShort size="small">Konto: {detalj.konto}</BodyShort>
                                                        </Table.HeaderCell>
                                                        <Table.DataCell align="right">
                                                            {formatCurrency(detalj.beløp)}
                                                        </Table.DataCell>
                                                        <Table.DataCell>
                                                            {detalj.tilbakeføring ? 'Ja' : 'Nei'}
                                                        </Table.DataCell>
                                                    </Table.Row>
                                                ))}
                                            </Table.Body>
                                        </Table>
                                    )}
                                </section>
                            ))}
                        </VStack>
                    </ExpansionCard.Content>
                </ExpansionCard>
            );
        })}
    </VStack>
);

export default HistoriskInfotrygdSimuleringsresultat;
