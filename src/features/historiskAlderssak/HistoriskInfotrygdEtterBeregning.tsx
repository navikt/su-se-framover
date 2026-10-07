import { VStack } from '@navikt/ds-react';
import { HistoriskInfotrygdRevurdering } from '~src/types/HistoriskInfotrygdRevurdering';
import HistoriskInfotrygdAttestantHandlinger from './HistoriskInfotrygdAttestantHandlinger';
import HistoriskInfotrygdForhåndsvarsel from './HistoriskInfotrygdForhåndsvarsel';
import HistoriskInfotrygdSaksbehandlerAttestering from './HistoriskInfotrygdSaksbehandlerAttestering';
import HistoriskInfotrygdVedtaksbrev from './HistoriskInfotrygdVedtaksbrev';

interface Props {
    behandling: HistoriskInfotrygdRevurdering;
    onOppdatert: () => void;
}

const HistoriskInfotrygdEtterBeregning = (props: Props) => {
    if (props.behandling.status === 'TIL_ATTESTERING') {
        return <HistoriskInfotrygdAttestantHandlinger {...props} />;
    }
    if (!['BEREGNET', 'UNDERKJENT'].includes(props.behandling.status)) {
        return null;
    }

    return (
        <VStack gap="6">
            <HistoriskInfotrygdForhåndsvarsel {...props} />
            <HistoriskInfotrygdVedtaksbrev {...props} />
            <HistoriskInfotrygdSaksbehandlerAttestering {...props} />
        </VStack>
    );
};

export default HistoriskInfotrygdEtterBeregning;
