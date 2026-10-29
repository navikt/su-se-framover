import { Box, Heading, VStack } from '@navikt/ds-react';
import {
    HistoriskInfotrygdManuellOpphørsgrunn,
    HistoriskInfotrygdMånedsgrunnlagForMåned,
    HistoriskInfotrygdMånedsresultat,
    HistoriskInfotrygdMånedsutkast,
} from '~src/types/HistoriskInfotrygdRevurdering';
import { HistoriskInfotrygdOpphørsgrunnForMåned } from './HistoriskInfotrygdOpphør';
import HistoriskInfotrygdVedtaksgrunnlag from './HistoriskInfotrygdVedtaksgrunnlag';
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
            <HistoriskInfotrygdVedtaksgrunnlag vedtaksgrunnlag={vedtaksgrunnlag} />
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
