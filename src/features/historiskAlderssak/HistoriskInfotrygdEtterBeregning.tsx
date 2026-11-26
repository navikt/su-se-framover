import * as RemoteData from '@devexperts/remote-data-ts';
import { Fieldset, VStack } from '@navikt/ds-react';
import { ApiResult } from '~src/lib/hooks';
import { HistoriskInfotrygdRevurdering } from '~src/types/HistoriskInfotrygdRevurdering';
import HistoriskInfotrygdAttestantHandlinger from './HistoriskInfotrygdAttestantHandlinger';
import HistoriskInfotrygdForhåndsvarsel from './HistoriskInfotrygdForhåndsvarsel';
import HistoriskInfotrygdSaksbehandlerAttestering from './HistoriskInfotrygdSaksbehandlerAttestering';
import HistoriskInfotrygdSimulering from './HistoriskInfotrygdSimulering';
import HistoriskInfotrygdVedtaksbrev from './HistoriskInfotrygdVedtaksbrev';

interface Props {
    behandling: HistoriskInfotrygdRevurdering;
    onOppdatert: () => void;
    simuleringsstatus: ApiResult<HistoriskInfotrygdRevurdering>;
    onSimuler: (revurderingId: string) => void;
    disabled: boolean;
}

const HistoriskInfotrygdEtterBeregning = (props: Props) => {
    if (!['BEREGNET', 'SIMULERT', 'UNDERKJENT', 'TIL_ATTESTERING', 'ATTESTERT'].includes(props.behandling.status)) {
        return null;
    }
    const harSimulering = (props.behandling.simulering?.resultat.perioder.length ?? 0) > 0;
    const harGyldigSimulering = harSimulering && props.behandling.status !== 'BEREGNET';
    const visBrevvalg =
        ['SIMULERT', 'UNDERKJENT', 'BEREGNET'].includes(props.behandling.status) &&
        (!props.behandling.simuleringTilgjengelig || harGyldigSimulering);
    const kallPågår = props.disabled || RemoteData.isPending(props.simuleringsstatus);
    const behandlingsProps = { behandling: props.behandling, onOppdatert: props.onOppdatert };

    return (
        <VStack gap="6">
            {(props.behandling.simuleringTilgjengelig || harSimulering) && (
                <HistoriskInfotrygdSimulering
                    key={props.behandling.id}
                    behandling={props.behandling}
                    status={props.simuleringsstatus}
                    onSimuler={props.onSimuler}
                    onOppdatert={() => window.location.reload()}
                    disabled={props.disabled}
                />
            )}
            {props.behandling.status === 'TIL_ATTESTERING' && (
                <HistoriskInfotrygdAttestantHandlinger {...behandlingsProps} />
            )}
            {visBrevvalg && (
                <Fieldset legend="Brev og attestering" hideLegend disabled={kallPågår}>
                    <VStack gap="6">
                        <HistoriskInfotrygdForhåndsvarsel {...behandlingsProps} />
                        <HistoriskInfotrygdVedtaksbrev {...behandlingsProps} />
                        <HistoriskInfotrygdSaksbehandlerAttestering {...behandlingsProps} />
                    </VStack>
                </Fieldset>
            )}
        </VStack>
    );
};

export default HistoriskInfotrygdEtterBeregning;
