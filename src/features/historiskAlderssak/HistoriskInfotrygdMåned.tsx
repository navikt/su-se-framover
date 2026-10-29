import { BodyShort, Box, Heading, Label, VStack } from '@navikt/ds-react';
import {
    HistoriskInfotrygdManuellOpphørsgrunn,
    HistoriskInfotrygdMånedsgrunnlagForMåned,
    HistoriskInfotrygdMånedsresultat,
    HistoriskInfotrygdMånedsutkast,
} from '~src/types/HistoriskInfotrygdRevurdering';
import { formatCurrency } from '~src/utils/format/formatUtils';
import { fradragskoderForVisning } from './HistoriskAlderssakUtils';
import styles from './HistoriskAlderssakVisning.module.less';
import { HistoriskInfotrygdOpphørsgrunnForMåned } from './HistoriskInfotrygdOpphør';
import HistoriskInfotrygdYtelse from './HistoriskInfotrygdYtelse';

interface Props {
    måned: HistoriskInfotrygdMånedsutkast;
    vedtaksgrunnlag: HistoriskInfotrygdMånedsgrunnlagForMåned;
    kanRedigeres: boolean;
    resultatForPerioden: HistoriskInfotrygdMånedsresultat;
    opphørsgrunnForPerioden: HistoriskInfotrygdManuellOpphørsgrunn | null;
    onOppdatert: (oppdater: (måned: HistoriskInfotrygdMånedsutkast) => HistoriskInfotrygdMånedsutkast) => void;
}

const HistoriskInfotrygdMåned = ({
    måned,
    vedtaksgrunnlag,
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
                {vedtaksgrunnlag.resultat === 'YTELSE' ? (
                    <>
                        <div>
                            <Label as="dt" size="small">
                                Historisk sats
                            </Label>
                            <BodyShort as="dd">{formatCurrency(vedtaksgrunnlag.sats)}</BodyShort>
                        </div>
                        <div>
                            <Label as="dt" size="small">
                                Historisk fradrag
                            </Label>
                            <dd className={styles.fradrag}>
                                <BodyShort>{formatCurrency(vedtaksgrunnlag.samletFradrag)}</BodyShort>
                                {vedtaksgrunnlag.kilde.type === 'INFOTRYGD' &&
                                    vedtaksgrunnlag.kilde.fradragskoder.length > 0 && (
                                        <ul className={styles.kodeliste} aria-label="Fradrag som inngår">
                                            {fradragskoderForVisning(vedtaksgrunnlag.kilde.fradragskoder).map(
                                                (kode, kodeindeks) => (
                                                    <li key={`${kode}-${kodeindeks}`}>
                                                        <BodyShort size="small">{kode}</BodyShort>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    )}
                            </dd>
                        </div>
                        <div>
                            <Label as="dt" size="small">
                                Historisk beløp
                            </Label>
                            <BodyShort as="dd">{formatCurrency(vedtaksgrunnlag.ytelsesbeløp)}</BodyShort>
                        </div>
                    </>
                ) : (
                    <div>
                        <Label as="dt" size="small">
                            Resultat før revurderingen
                        </Label>
                        <BodyShort as="dd">Ingen ytelse</BodyShort>
                    </div>
                )}
                <div>
                    <Label as="dt" size="small">
                        Kilde
                    </Label>
                    <BodyShort as="dd">
                        {vedtaksgrunnlag.kilde.type === 'INFOTRYGD'
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
