import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyShort, Box, Button, Heading, VStack } from '@navikt/ds-react';
import { sendHistoriskRevurderingTilAttestering } from '~src/api/historiskAlderssakApi';
import { useApiCall } from '~src/lib/hooks';
import {
    HistoriskInfotrygdRevurdering,
    HistoriskInfotrygdSperregrunnForAttestering,
} from '~src/types/HistoriskInfotrygdRevurdering';
import HistoriskAlderssakApiErrorAlert from './HistoriskAlderssakApiErrorAlert';

interface Props {
    behandling: HistoriskInfotrygdRevurdering;
    onOppdatert: () => void;
}

const sperregrunnTekst: Record<HistoriskInfotrygdSperregrunnForAttestering, string> = {
    MANGLER_BEREGNING: 'Behandlingen må beregnes.',
    BEREGNING_DEKKER_IKKE_HELE_PERIODEN: 'Beregningen må dekke hele behandlingsperioden.',
    MANGLER_GYLDIG_FORHANDSVARSEL: 'Det må tas et gyldig valg om forhåndsvarsel.',
    MANGLER_VEDTAKSBREVVALG: 'Det må velges om vedtaksbrev skal sendes.',
    MANGLER_FRITEKST_TIL_VEDTAKSBREV: 'Fritekst til vedtaksbrevet må fylles ut.',
};

const HistoriskInfotrygdSaksbehandlerAttestering = (props: Props) => {
    const [status, send] = useApiCall(sendHistoriskRevurderingTilAttestering);
    return (
        <Box background="surface-default" borderWidth="1" borderRadius="medium" padding="5">
            <VStack gap="4" align="start">
                <Heading level="2" size="medium">
                    Send til attestering
                </Heading>
                {props.behandling.sperregrunnerForAttestering.length > 0 && (
                    <Alert variant="warning">
                        <VStack gap="2">
                            <BodyShort weight="semibold">Dette må fullføres før attestering:</BodyShort>
                            <ul>
                                {props.behandling.sperregrunnerForAttestering.map((grunn) => (
                                    <li key={grunn}>{sperregrunnTekst[grunn]}</li>
                                ))}
                            </ul>
                        </VStack>
                    </Alert>
                )}
                {RemoteData.isFailure(status) && <HistoriskAlderssakApiErrorAlert error={status.error} />}
                <Button
                    type="button"
                    disabled={props.behandling.sperregrunnerForAttestering.length > 0}
                    loading={RemoteData.isPending(status)}
                    onClick={() => send(props.behandling.id, props.onOppdatert)}
                >
                    Send til attestering
                </Button>
            </VStack>
        </Box>
    );
};

export default HistoriskInfotrygdSaksbehandlerAttestering;
