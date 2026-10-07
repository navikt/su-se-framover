import { BodyShort, Box, Heading, Label, VStack } from '@navikt/ds-react';
import {
    HistoriskInfotrygdBeregningsgrunnlagForMåned,
    HistoriskInfotrygdManuellOpphørsgrunn,
    HistoriskInfotrygdMånedsgrunnlagForMåned,
    HistoriskInfotrygdMånedsresultat,
} from '~src/types/HistoriskInfotrygdRevurdering';
import { formatCurrency } from '~src/utils/format/formatUtils';
import { fradragskoderForVisning } from './HistoriskAlderssakUtils';
import styles from './HistoriskAlderssakVisning.module.less';
import { HistoriskInfotrygdOpphørsgrunnForMåned } from './HistoriskInfotrygdOpphør';
import HistoriskInfotrygdYtelse from './HistoriskInfotrygdYtelse';

interface Props {
    måned: HistoriskInfotrygdBeregningsgrunnlagForMåned;
    historisk: HistoriskInfotrygdMånedsgrunnlagForMåned;
    kanRedigeres: boolean;
    resultatForPerioden: HistoriskInfotrygdMånedsresultat;
    opphørsgrunnForPerioden: HistoriskInfotrygdManuellOpphørsgrunn | null;
    onOppdatert: (
        oppdater: (måned: HistoriskInfotrygdBeregningsgrunnlagForMåned) => HistoriskInfotrygdBeregningsgrunnlagForMåned,
    ) => void;
}

const HistoriskInfotrygdMåned = ({
    måned,
    historisk,
    kanRedigeres,
    resultatForPerioden,
    opphørsgrunnForPerioden,
    onOppdatert,
}: Props) => (
    <Box background="surface-default" borderWidth="1" borderRadius="medium" padding="5">
        <VStack gap="4">
            <Heading level="3" size="small">
                {måned.måned}
            </Heading>
            <dl className={styles.detaljer}>
                <div>
                    <Label as="dt" size="small">
                        Historisk sats
                    </Label>
                    <BodyShort as="dd">
                        {historisk.historiskSats === null ? 'Ikke registrert' : formatCurrency(historisk.historiskSats)}
                    </BodyShort>
                </div>
                <div>
                    <Label as="dt" size="small">
                        Historisk fradrag
                    </Label>
                    <dd className={styles.fradrag}>
                        <BodyShort>
                            {historisk.historiskFradrag === null
                                ? 'Ikke registrert'
                                : formatCurrency(historisk.historiskFradrag)}
                        </BodyShort>
                        {historisk.historiskFradragskoder.length > 0 && (
                            <ul className={styles.kodeliste} aria-label="Fradrag som inngår">
                                {fradragskoderForVisning(historisk.historiskFradragskoder).map((kode, kodeindeks) => (
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
                        Historisk beløp
                    </Label>
                    <BodyShort as="dd">
                        {historisk.historiskBeløp === null
                            ? 'Ikke registrert'
                            : formatCurrency(historisk.historiskBeløp)}
                    </BodyShort>
                </div>
                <div>
                    <Label as="dt" size="small">
                        Kilde
                    </Label>
                    <BodyShort as="dd">
                        {historisk.kilde === 'ORIGINAL_PROJEKSJON'
                            ? 'Opprinnelig Infotrygd-vedtak'
                            : 'Tidligere historisk revurdering'}
                    </BodyShort>
                </div>
            </dl>
            {resultatForPerioden === 'YTELSE' && (
                <HistoriskInfotrygdYtelse måned={måned} kanRedigeres={kanRedigeres} onOppdatert={onOppdatert} />
            )}
            {resultatForPerioden === 'OPPHØR' && (
                <HistoriskInfotrygdOpphørsgrunnForMåned opphørsgrunnForPerioden={opphørsgrunnForPerioden} />
            )}
        </VStack>
    </Box>
);

export default HistoriskInfotrygdMåned;
