import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyShort, Box, Button, Heading, VStack } from '@navikt/ds-react';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { ApiResult } from '~src/lib/hooks';
import { HistoriskInfotrygdRevurdering } from '~src/types/HistoriskInfotrygdRevurdering';
import { formatDate } from '~src/utils/date/dateUtils';

import HistoriskInfotrygdSimuleringsresultat from './HistoriskInfotrygdSimuleringsresultat';

interface Props {
    behandling: HistoriskInfotrygdRevurdering;
    status: ApiResult<HistoriskInfotrygdRevurdering>;
    onSimuler: (revurderingId: string) => void;
    onOppdatert: () => void;
    disabled: boolean;
}

const HistoriskInfotrygdSimulering = ({ behandling, status, onSimuler, onOppdatert, disabled }: Props) => {
    const kanSimulere =
        behandling.simuleringTilgjengelig && ['BEREGNET', 'SIMULERT', 'UNDERKJENT'].includes(behandling.status);
    const venterPåSvar = RemoteData.isPending(status);
    const utilgjengelig = disabled || venterPåSvar;

    return (
        <Box background="surface-default" borderWidth="1" borderRadius="medium" padding="5">
            <VStack gap="5">
                <div>
                    <Heading level="2" size="medium" spacing>
                        Simulering
                    </Heading>
                    <BodyShort>
                        Simuleringen bruker den siste lagrede beregningen. Den sender ingen utbetaling.
                    </BodyShort>
                    <BodyShort>
                        Periode: {formatDate(behandling.periode.fraOgMed)}–{formatDate(behandling.periode.tilOgMed)}.
                    </BodyShort>
                </div>
                {kanSimulere && (
                    <div>
                        <Button
                            type="button"
                            loading={venterPåSvar}
                            disabled={utilgjengelig}
                            onClick={() => !utilgjengelig && onSimuler(behandling.id)}
                        >
                            {behandling.simulering ? 'Simuler på nytt' : 'Simuler'}
                        </Button>
                    </div>
                )}
                {RemoteData.isInitial(status) && behandling.simulering === null && (
                    <BodyShort>Simuler beregningen før du går videre til brev og attestering.</BodyShort>
                )}
                {venterPåSvar && <BodyShort role="status">Simulerer beregningen.</BodyShort>}
                {RemoteData.isFailure(status) && (
                    <VStack gap="3" align="start">
                        <ApiErrorAlert error={status.error} />
                        <Button type="button" variant="secondary" onClick={onOppdatert} disabled={disabled}>
                            Hent behandlingen på nytt
                        </Button>
                        <BodyShort size="small">Ulagrede endringer forkastes når siden lastes på nytt.</BodyShort>
                    </VStack>
                )}
                {RemoteData.isSuccess(status) && behandling.simulering === null && (
                    <Alert variant="error">
                        Svaret mangler simuleringsresultat. Hent behandlingen på nytt før du fortsetter.
                    </Alert>
                )}
                {behandling.simulering && (
                    <HistoriskInfotrygdSimuleringsresultat
                        key={behandling.simulering.simulert}
                        simulering={behandling.simulering}
                        revurderingsperiode={behandling.periode}
                    />
                )}
            </VStack>
        </Box>
    );
};

export default HistoriskInfotrygdSimulering;
