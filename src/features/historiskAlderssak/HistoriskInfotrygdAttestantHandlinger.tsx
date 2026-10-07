import * as RemoteData from '@devexperts/remote-data-ts';
import { Box, Button, Heading, Textarea, VStack } from '@navikt/ds-react';
import { useState } from 'react';
import { attesterHistoriskRevurdering, underkjennHistoriskRevurdering } from '~src/api/historiskAlderssakApi';
import { useApiCall } from '~src/lib/hooks';
import { HistoriskInfotrygdRevurdering } from '~src/types/HistoriskInfotrygdRevurdering';
import HistoriskAlderssakApiErrorAlert from './HistoriskAlderssakApiErrorAlert';

interface Props {
    behandling: HistoriskInfotrygdRevurdering;
    onOppdatert: () => void;
}

const HistoriskInfotrygdAttestantHandlinger = (props: Props) => {
    const [begrunnelse, setBegrunnelse] = useState('');
    const [begrunnelseFeil, setBegrunnelseFeil] = useState<string>();
    const [underkjennStatus, underkjenn] = useApiCall(underkjennHistoriskRevurdering);
    const [attesterStatus, attester] = useApiCall(attesterHistoriskRevurdering);
    const kallPågår = RemoteData.isPending(attesterStatus) || RemoteData.isPending(underkjennStatus);

    const handleUnderkjenn = () => {
        const trimmetBegrunnelse = begrunnelse.trim();
        if (!trimmetBegrunnelse) {
            setBegrunnelseFeil('Skriv hvorfor behandlingen underkjennes.');
            return;
        }
        setBegrunnelseFeil(undefined);
        underkjenn({ revurderingId: props.behandling.id, begrunnelse: trimmetBegrunnelse }, props.onOppdatert);
    };

    return (
        <Box background="surface-default" borderWidth="1" borderRadius="medium" padding="5">
            <VStack gap="4" align="start">
                <Heading level="2" size="medium">
                    Attestering
                </Heading>
                <Textarea
                    label="Begrunnelse for underkjenning"
                    value={begrunnelse}
                    onChange={(event) => setBegrunnelse(event.target.value)}
                    error={begrunnelseFeil}
                />
                {RemoteData.isFailure(underkjennStatus) && (
                    <HistoriskAlderssakApiErrorAlert error={underkjennStatus.error} />
                )}
                {RemoteData.isFailure(attesterStatus) && (
                    <HistoriskAlderssakApiErrorAlert error={attesterStatus.error} />
                )}
                <VStack gap="3" align="start">
                    <Button
                        type="button"
                        loading={RemoteData.isPending(attesterStatus)}
                        disabled={RemoteData.isPending(underkjennStatus)}
                        onClick={() => !kallPågår && attester(props.behandling.id, props.onOppdatert)}
                    >
                        Attester behandlingsgrunnlaget
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        loading={RemoteData.isPending(underkjennStatus)}
                        disabled={RemoteData.isPending(attesterStatus)}
                        onClick={() => !kallPågår && handleUnderkjenn()}
                    >
                        Underkjenn
                    </Button>
                </VStack>
            </VStack>
        </Box>
    );
};

export default HistoriskInfotrygdAttestantHandlinger;
