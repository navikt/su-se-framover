import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Box, Button, Heading, Radio, RadioGroup, Textarea, VStack } from '@navikt/ds-react';
import { useState } from 'react';
import {
    hentHistoriskForhåndsvarselutkast,
    ikkeSendHistoriskForhåndsvarsel,
    sendHistoriskForhåndsvarsel,
} from '~src/api/historiskAlderssakApi';
import { useApiCall, useBrevForhåndsvisning } from '~src/lib/hooks';
import { HistoriskInfotrygdRevurdering } from '~src/types/HistoriskInfotrygdRevurdering';
import HistoriskAlderssakApiErrorAlert from './HistoriskAlderssakApiErrorAlert';
import HistoriskInfotrygdMottaker from './HistoriskInfotrygdMottaker';

interface Props {
    behandling: HistoriskInfotrygdRevurdering;
    onOppdatert: () => void;
}

const HistoriskInfotrygdForhåndsvarsel = (props: Props) => {
    const [valg, setValg] = useState<'SEND' | 'IKKE_SEND'>(
        props.behandling.forhåndsvarsel.status === 'SENDT' ? 'SEND' : 'IKKE_SEND',
    );
    const [fritekst, setFritekst] = useState(props.behandling.forhåndsvarsel.fritekst ?? '');
    const [feil, setFeil] = useState<string>();
    const [sendStatus, send] = useApiCall(sendHistoriskForhåndsvarsel);
    const [ikkeSendStatus, ikkeSend] = useApiCall(ikkeSendHistoriskForhåndsvarsel);
    const [utkastStatus, visUtkast] = useBrevForhåndsvisning(hentHistoriskForhåndsvarselutkast);

    const lagreValg = () => {
        if (valg === 'SEND') {
            if (!fritekst.trim()) {
                setFeil('Skriv teksten som skal brukes i forhåndsvarselet.');
                return;
            }
            setFeil(undefined);
            send({ revurderingId: props.behandling.id, fritekst: fritekst.trim() }, props.onOppdatert);
            return;
        }
        setFeil(undefined);
        ikkeSend(props.behandling.id, props.onOppdatert);
    };

    return (
        <Box background="surface-subtle" borderWidth="1" borderRadius="medium" padding="5">
            <VStack gap="4" align="start">
                <Heading level="2" size="medium">
                    Forhåndsvarsel
                </Heading>
                {props.behandling.forhåndsvarsel.erUtdatert && (
                    <Alert variant="warning">
                        Beregningsgrunnlaget er endret. Send et nytt forhåndsvarsel eller velg at det ikke skal sendes.
                    </Alert>
                )}
                <RadioGroup legend="Skal det sendes forhåndsvarsel?" value={valg} onChange={setValg}>
                    <Radio value="SEND">Ja, send forhåndsvarsel</Radio>
                    <Radio value="IKKE_SEND">Nei, ikke send forhåndsvarsel</Radio>
                </RadioGroup>
                {valg === 'SEND' && (
                    <Textarea
                        label="Fritekst til forhåndsvarselet"
                        value={fritekst}
                        onChange={(event) => setFritekst(event.target.value)}
                        error={feil}
                    />
                )}
                {valg === 'SEND' && (
                    <HistoriskInfotrygdMottaker
                        sakId={props.behandling.sakId}
                        revurderingId={props.behandling.id}
                        brevtype="FORHANDSVARSEL"
                    />
                )}
                {RemoteData.isFailure(sendStatus) && <HistoriskAlderssakApiErrorAlert error={sendStatus.error} />}
                {RemoteData.isFailure(ikkeSendStatus) && (
                    <HistoriskAlderssakApiErrorAlert error={ikkeSendStatus.error} />
                )}
                {RemoteData.isFailure(utkastStatus) && <HistoriskAlderssakApiErrorAlert error={utkastStatus.error} />}
                <VStack gap="3" align="start">
                    {valg === 'SEND' && (
                        <Button
                            type="button"
                            variant="secondary"
                            loading={RemoteData.isPending(utkastStatus)}
                            onClick={() => visUtkast({ revurderingId: props.behandling.id, fritekst })}
                        >
                            Forhåndsvis varsel
                        </Button>
                    )}
                    <Button
                        type="button"
                        loading={RemoteData.isPending(sendStatus) || RemoteData.isPending(ikkeSendStatus)}
                        onClick={lagreValg}
                    >
                        {valg === 'SEND' ? 'Send forhåndsvarsel' : 'Lagre valget'}
                    </Button>
                </VStack>
            </VStack>
        </Box>
    );
};

export default HistoriskInfotrygdForhåndsvarsel;
