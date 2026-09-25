import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyShort, Box, Button, Heading, Radio, RadioGroup, Textarea, VStack } from '@navikt/ds-react';
import { useState } from 'react';

import {
    attesterHistoriskRevurdering,
    hentHistoriskForhåndsvarselutkast,
    hentHistoriskVedtaksbrevutkast,
    ikkeSendHistoriskForhåndsvarsel,
    lagreHistoriskVedtaksbrev,
    sendHistoriskForhåndsvarsel,
    sendHistoriskRevurderingTilAttestering,
    underkjennHistoriskRevurdering,
} from '~src/api/historiskAlderssakApi';
import { useApiCall, useBrevForhåndsvisning } from '~src/lib/hooks';
import {
    HistoriskInfotrygdRevurdering,
    HistoriskInfotrygdSperregrunnForAttestering,
    HistoriskInfotrygdVedtaksbrevvalg,
} from '~src/types/HistoriskInfotrygdRevurdering';

import HistoriskAlderssakApiErrorAlert from './HistoriskAlderssakApiErrorAlert';

interface Props {
    behandling: HistoriskInfotrygdRevurdering;
    onOppdatert: () => void;
}

const sperregrunnTekst: Record<HistoriskInfotrygdSperregrunnForAttestering, string> = {
    MANGLER_BEREGNING: 'Behandlingen må beregnes.',
    BEREGNING_DEKKER_IKKE_HELE_PERIODEN: 'Beregningen må dekke hele behandlingsperioden.',
    MANGLER_BEGRUNNELSE: 'Behandlingen må ha en begrunnelse.',
    MANGLER_BEKREFTELSE_AV_HISTORISK_FORSORGINGSTILLEGG:
        'Historisk månedsbeløp må kontrolleres for mulig forsørgingstillegg.',
    MANGLER_GYLDIG_FORHANDSVARSEL: 'Det må tas et gyldig valg om forhåndsvarsel.',
    MANGLER_VEDTAKSBREVVALG: 'Det må velges om vedtaksbrev skal sendes.',
    MANGLER_FRITEKST_TIL_VEDTAKSBREV: 'Fritekst til vedtaksbrevet må fylles ut.',
    BLANDET_RESULTAT_MAA_BEHANDLES_SEPARAT: 'Ytelse og opphør må behandles i separate, ikke-overlappende behandlinger.',
};

const Forhåndsvarsel = (props: Props) => {
    const [valg, setValg] = useState<'SEND' | 'IKKE_SEND'>(
        props.behandling.forhåndsvarsel.status === 'SENDT' ? 'SEND' : 'IKKE_SEND',
    );
    const [fritekst, setFritekst] = useState(props.behandling.forhåndsvarsel.fritekst ?? '');
    const [begrunnelse, setBegrunnelse] = useState(props.behandling.forhåndsvarsel.begrunnelse ?? '');
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
        if (!begrunnelse.trim()) {
            setFeil('Begrunn hvorfor forhåndsvarsel ikke skal sendes.');
            return;
        }
        setFeil(undefined);
        ikkeSend({ revurderingId: props.behandling.id, begrunnelse: begrunnelse.trim() }, props.onOppdatert);
    };

    return (
        <Box background="surface-subtle" borderWidth="1" borderRadius="medium" padding="5">
            <VStack gap="4" align="start">
                <Heading level="2" size="medium">
                    Forhåndsvarsel
                </Heading>
                {props.behandling.forhåndsvarsel.erUtdatert && (
                    <Alert variant="warning">
                        Beregningsgrunnlaget er endret. Send et nytt forhåndsvarsel eller begrunn hvorfor nytt varsel
                        ikke er nødvendig.
                    </Alert>
                )}
                <RadioGroup legend="Skal det sendes forhåndsvarsel?" value={valg} onChange={setValg}>
                    <Radio value="SEND">Ja, send forhåndsvarsel</Radio>
                    <Radio value="IKKE_SEND">Nei, ikke send forhåndsvarsel</Radio>
                </RadioGroup>
                {valg === 'SEND' ? (
                    <Textarea
                        label="Fritekst til forhåndsvarselet"
                        value={fritekst}
                        onChange={(event) => setFritekst(event.target.value)}
                        error={feil}
                    />
                ) : (
                    <Textarea
                        label="Begrunnelse"
                        value={begrunnelse}
                        onChange={(event) => setBegrunnelse(event.target.value)}
                        error={feil}
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

const Vedtaksbrev = (props: Props) => {
    const [valg, setValg] = useState<Exclude<HistoriskInfotrygdVedtaksbrevvalg, 'IKKE_VALGT'>>(
        props.behandling.vedtaksbrevvalg === 'SEND' ? 'SEND' : 'IKKE_SEND',
    );
    const [fritekst, setFritekst] = useState(props.behandling.vedtaksbrevFritekst ?? '');
    const [feil, setFeil] = useState<string>();
    const [lagreStatus, lagre] = useApiCall(lagreHistoriskVedtaksbrev);
    const [utkastStatus, visUtkast] = useBrevForhåndsvisning(hentHistoriskVedtaksbrevutkast);

    const handleLagre = () => {
        if (valg === 'SEND' && !fritekst.trim()) {
            setFeil('Skriv friteksten som skal brukes i vedtaksbrevet.');
            return;
        }
        setFeil(undefined);
        lagre(
            {
                revurderingId: props.behandling.id,
                request: { valg, fritekst: valg === 'SEND' ? fritekst.trim() : fritekst.trim() || null },
            },
            props.onOppdatert,
        );
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
                {RemoteData.isFailure(lagreStatus) && <HistoriskAlderssakApiErrorAlert error={lagreStatus.error} />}
                {RemoteData.isFailure(utkastStatus) && <HistoriskAlderssakApiErrorAlert error={utkastStatus.error} />}
                <VStack gap="3" align="start">
                    <Button
                        type="button"
                        variant="secondary"
                        loading={RemoteData.isPending(utkastStatus)}
                        onClick={() => visUtkast(props.behandling.id)}
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

const SaksbehandlerAttestering = (props: Props) => {
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

const AttestantHandlinger = (props: Props) => {
    const [begrunnelse, setBegrunnelse] = useState('');
    const [underkjennStatus, underkjenn] = useApiCall(underkjennHistoriskRevurdering);
    const [attesterStatus, attester] = useApiCall(attesterHistoriskRevurdering);

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
                        onClick={() => attester(props.behandling.id, props.onOppdatert)}
                    >
                        Attester behandlingsgrunnlaget
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        loading={RemoteData.isPending(underkjennStatus)}
                        onClick={() =>
                            begrunnelse.trim() &&
                            underkjenn(
                                { revurderingId: props.behandling.id, begrunnelse: begrunnelse.trim() },
                                props.onOppdatert,
                            )
                        }
                    >
                        Underkjenn
                    </Button>
                </VStack>
            </VStack>
        </Box>
    );
};

const HistoriskInfotrygdEtterBeregning = (props: Props) => {
    if (props.behandling.status === 'TIL_ATTESTERING') {
        return <AttestantHandlinger {...props} />;
    }
    if (!['BEREGNET', 'UNDERKJENT'].includes(props.behandling.status)) {
        return null;
    }

    return (
        <VStack gap="6">
            <Forhåndsvarsel {...props} />
            <Vedtaksbrev {...props} />
            <SaksbehandlerAttestering {...props} />
        </VStack>
    );
};

export default HistoriskInfotrygdEtterBeregning;
