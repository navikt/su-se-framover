import * as RemoteData from '@devexperts/remote-data-ts';
import { Box, Button, Heading, Radio, RadioGroup, Textarea, VStack } from '@navikt/ds-react';
import { useState } from 'react';
import { hentHistoriskVedtaksbrevutkast, lagreHistoriskVedtaksbrev } from '~src/api/historiskAlderssakApi';
import { useApiCall, useBrevForhåndsvisning } from '~src/lib/hooks';
import {
    HistoriskInfotrygdRevurdering,
    HistoriskInfotrygdVedtaksbrevvalg,
} from '~src/types/HistoriskInfotrygdRevurdering';
import HistoriskAlderssakApiErrorAlert from './HistoriskAlderssakApiErrorAlert';
import HistoriskInfotrygdMottaker from './HistoriskInfotrygdMottaker';

interface Props {
    behandling: HistoriskInfotrygdRevurdering;
    onOppdatert: () => void;
}

const HistoriskInfotrygdVedtaksbrev = (props: Props) => {
    const [valg, setValg] = useState<Exclude<HistoriskInfotrygdVedtaksbrevvalg, 'IKKE_VALGT'>>(
        props.behandling.vedtaksbrevvalg === 'SEND' ? 'SEND' : 'IKKE_SEND',
    );
    const [fritekst, setFritekst] = useState(props.behandling.vedtaksbrevFritekst ?? '');
    const [feil, setFeil] = useState<string>();
    const [lagreStatus, lagre] = useApiCall(lagreHistoriskVedtaksbrev);
    const [utkastStatus, visUtkast] = useBrevForhåndsvisning(hentHistoriskVedtaksbrevutkast);

    const vedtaksbrevRequest = {
        revurderingId: props.behandling.id,
        request: { valg, fritekst: valg === 'SEND' ? fritekst.trim() : fritekst.trim() || null },
    };

    const validerVedtaksbrev = () => {
        if (valg === 'SEND' && !fritekst.trim()) {
            setFeil('Skriv friteksten som skal brukes i vedtaksbrevet.');
            return false;
        }
        setFeil(undefined);
        return true;
    };

    const handleLagre = () => {
        if (!validerVedtaksbrev()) {
            return;
        }
        lagre(vedtaksbrevRequest, props.onOppdatert);
    };

    const handleForhåndsvis = () => {
        if (valg !== 'SEND' || !validerVedtaksbrev()) {
            return;
        }

        const fritekstErLagret =
            props.behandling.vedtaksbrevvalg === 'SEND' && props.behandling.vedtaksbrevFritekst === fritekst.trim();

        if (fritekstErLagret) {
            visUtkast(props.behandling.id);
            return;
        }

        lagre(vedtaksbrevRequest, () => {
            props.onOppdatert();
            visUtkast(props.behandling.id);
        });
    };

    return (
        <Box background="surface-subtle" borderWidth="1" borderRadius="medium" padding="5">
            <VStack gap="4" align="start">
                <Heading level="2" size="medium">
                    Vedtaksbrev
                </Heading>
                <RadioGroup legend="Skal det sendes vedtaksbrev?" value={valg} onChange={setValg}>
                    <Radio value="SEND">Ja, send vedtaksbrev</Radio>
                    <Radio value="IKKE_SEND">Nei, ikke send vedtaksbrev</Radio>
                </RadioGroup>
                <Textarea
                    label="Fritekst til vedtaksbrevet"
                    value={fritekst}
                    onChange={(event) => setFritekst(event.target.value)}
                    error={feil}
                />
                {valg === 'SEND' && (
                    <HistoriskInfotrygdMottaker
                        sakId={props.behandling.sakId}
                        revurderingId={props.behandling.id}
                        brevtype="VEDTAK"
                    />
                )}
                {RemoteData.isFailure(lagreStatus) && <HistoriskAlderssakApiErrorAlert error={lagreStatus.error} />}
                {RemoteData.isFailure(utkastStatus) && <HistoriskAlderssakApiErrorAlert error={utkastStatus.error} />}
                <VStack gap="3" align="start">
                    <Button
                        type="button"
                        variant="secondary"
                        disabled={valg !== 'SEND'}
                        loading={RemoteData.isPending(lagreStatus) || RemoteData.isPending(utkastStatus)}
                        onClick={handleForhåndsvis}
                    >
                        Forhåndsvis vedtaksbrev
                    </Button>
                    <Button type="button" loading={RemoteData.isPending(lagreStatus)} onClick={handleLagre}>
                        Lagre brevvalg
                    </Button>
                </VStack>
            </VStack>
        </Box>
    );
};

export default HistoriskInfotrygdVedtaksbrev;
