import { BodyShort, ExpansionCard, Heading, Label, VStack } from '@navikt/ds-react';
import {
    HistoriskInfotrygdLagretBeregning,
    HistoriskInfotrygdMånedsgrunnlag,
} from '~src/types/HistoriskInfotrygdRevurdering';
import { formatCurrency } from '~src/utils/format/formatUtils';
import { fradragskoderForVisning } from './HistoriskAlderssakUtils';
import styles from './HistoriskAlderssakVisning.module.less';

interface Props {
    grunnlag: HistoriskInfotrygdMånedsgrunnlag;
    beregning: HistoriskInfotrygdLagretBeregning;
}

const økonomiskRetningTekst = {
    INGEN_ENDRING: 'Ingen endring',
    ETTERBETALING: 'Etterbetaling',
    FEILUTBETALING: 'Feilutbetaling',
} as const;

const HistoriskInfotrygdBeregningsresultat = ({ grunnlag, beregning }: Props) => (
    <section aria-labelledby="beregningsresultat-tittel">
        <VStack gap="4">
            <div>
                <Heading id="beregningsresultat-tittel" level="2" size="medium" spacing>
                    Beregning
                </Heading>
                <BodyShort>Økonomisk retning: {økonomiskRetningTekst[beregning.økonomiskRetning]}</BodyShort>
                <BodyShort>Antall måneder: {beregning.måneder.length}</BodyShort>
            </div>
            {beregning.måneder.map((resultat) => {
                const historisk = grunnlag.måneder.find((måned) => måned.måned === resultat.måned);

                return (
                    <ExpansionCard key={resultat.måned} aria-label={`Beregning for ${resultat.måned}`}>
                        <ExpansionCard.Header>
                            <ExpansionCard.Title as="h3" size="small">
                                {resultat.måned}
                            </ExpansionCard.Title>
                            <ExpansionCard.Description>
                                {resultat.nyttResultat === 'YTELSE' ? 'Ytelse' : 'Opphør'}. Gammelt beløp:{' '}
                                {formatCurrency(resultat.gammeltBeløp)}. Nytt beløp:{' '}
                                {formatCurrency(resultat.nyttBeløp)}. Differanse: {formatCurrency(resultat.differanse)}.
                            </ExpansionCard.Description>
                        </ExpansionCard.Header>
                        <ExpansionCard.Content>
                            <div className={styles.beregningssammenligning}>
                                <section aria-label="Grunnlag før revurderingen">
                                    <Heading level="4" size="xsmall" spacing>
                                        Grunnlag før revurderingen
                                    </Heading>
                                    <dl className={styles.detaljer}>
                                        <div>
                                            <Label as="dt" size="small">
                                                Beløp brukt i beregningen
                                            </Label>
                                            <BodyShort as="dd">{formatCurrency(resultat.gammeltBeløp)}</BodyShort>
                                        </div>
                                        <div>
                                            <Label as="dt" size="small">
                                                Historisk sats
                                            </Label>
                                            <BodyShort as="dd">
                                                {historisk?.historiskSats === null ||
                                                historisk?.historiskSats === undefined
                                                    ? 'Ikke registrert'
                                                    : formatCurrency(historisk.historiskSats)}
                                            </BodyShort>
                                        </div>
                                        <div>
                                            <Label as="dt" size="small">
                                                Historisk fradrag
                                            </Label>
                                            <BodyShort as="dd">
                                                {historisk?.historiskFradrag === null ||
                                                historisk?.historiskFradrag === undefined
                                                    ? 'Ikke registrert'
                                                    : formatCurrency(historisk.historiskFradrag)}
                                            </BodyShort>
                                        </div>
                                        <div>
                                            <Label as="dt" size="small">
                                                Historisk beløp
                                            </Label>
                                            <BodyShort as="dd">
                                                {historisk?.historiskBeløp === null ||
                                                historisk?.historiskBeløp === undefined
                                                    ? 'Ikke registrert'
                                                    : formatCurrency(historisk.historiskBeløp)}
                                            </BodyShort>
                                        </div>
                                        {historisk && historisk.historiskFradragskoder.length > 0 && (
                                            <div>
                                                <Label as="dt" size="small">
                                                    Historiske fradragskoder
                                                </Label>
                                                <BodyShort as="dd">
                                                    {fradragskoderForVisning(historisk.historiskFradragskoder).join(
                                                        ', ',
                                                    )}
                                                </BodyShort>
                                            </div>
                                        )}
                                    </dl>
                                </section>
                                <section aria-label="Ny beregning">
                                    <Heading level="4" size="xsmall" spacing>
                                        Ny beregning
                                    </Heading>
                                    <dl className={styles.detaljer}>
                                        <div>
                                            <Label as="dt" size="small">
                                                Satskategori
                                            </Label>
                                            <BodyShort as="dd">{resultat.satskategori}</BodyShort>
                                        </div>
                                        <div>
                                            <Label as="dt" size="small">
                                                Nye fradrag
                                            </Label>
                                            {resultat.fradrag.length > 0 ? (
                                                <ul className={styles.beregningsfradrag}>
                                                    {resultat.fradrag.map((fradrag, index) => (
                                                        <li key={`${fradrag.type}-${index}`}>
                                                            {fradrag.type}
                                                            {fradrag.beskrivelse ? ` (${fradrag.beskrivelse})` : ''}:{' '}
                                                            {formatCurrency(fradrag.månedsbeløp)}{' '}
                                                            {fradrag.tilhører === 'EPS' ? '(ektefellen)' : '(brukeren)'}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <BodyShort as="dd">Ingen fradrag</BodyShort>
                                            )}
                                        </div>
                                        <div>
                                            <Label as="dt" size="small">
                                                Nytt beløp
                                            </Label>
                                            <BodyShort as="dd">{formatCurrency(resultat.nyttBeløp)}</BodyShort>
                                        </div>
                                        <div>
                                            <Label as="dt" size="small">
                                                Differanse
                                            </Label>
                                            <BodyShort as="dd">{formatCurrency(resultat.differanse)}</BodyShort>
                                        </div>
                                        <div>
                                            <Label as="dt" size="small">
                                                Nytt resultat
                                            </Label>
                                            <BodyShort as="dd">
                                                {resultat.nyttResultat === 'YTELSE' ? 'Ytelse' : 'Opphør'}
                                            </BodyShort>
                                        </div>
                                        {resultat.opphørsgrunn && (
                                            <div>
                                                <Label as="dt" size="small">
                                                    Opphørsgrunn
                                                </Label>
                                                <BodyShort as="dd">{resultat.opphørsgrunn}</BodyShort>
                                            </div>
                                        )}
                                    </dl>
                                </section>
                            </div>
                        </ExpansionCard.Content>
                    </ExpansionCard>
                );
            })}
        </VStack>
    </section>
);

export default HistoriskInfotrygdBeregningsresultat;
